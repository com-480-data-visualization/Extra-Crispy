from __future__ import annotations

import csv
import json
import re
from dataclasses import dataclass
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator


SOURCE_FILE_PATTERN = re.compile(
    r"^(artists|artworks)_(country|continent)_(5year|decade)_explore\.csv$"
)

DISTRIBUTION_COLUMN_BY_GEO = {
    "country": "nationalities",
    "continent": "continents",
}

Y_LABEL_BY_METRIC = {
    "artists": "Number of artists",
    "artworks": "Number of artworks",
}

COLOR_BY_GEO = {
    "country": "#286f9f",
    "continent": "#b35c3f",
}


@dataclass(frozen=True)
class SourceKey:
    metric: str
    geo: str
    period: str


@dataclass(frozen=True)
class TimeRow:
    label: str
    start_year: int
    values: dict[str, int]


def find_repo_root() -> Path:
    current_path = Path(__file__).resolve()
    for candidate in (current_path.parent, *current_path.parents):
        if (candidate / "data" / "distribution" / "explore").is_dir():
            return candidate
    raise FileNotFoundError("Could not find repository root containing data/distribution/explore")


ROOT_DIR = find_repo_root()
INPUT_DIR = ROOT_DIR / "data" / "distribution" / "explore"
OUTPUT_DIR = ROOT_DIR / "Graph" / "distribution"


def parse_source_key(path: Path) -> SourceKey:
    match = SOURCE_FILE_PATTERN.match(path.name)
    if match is None:
        raise ValueError(f"Unexpected explore CSV filename: {path.name}")
    metric, geo, period = match.groups()
    return SourceKey(metric=metric, geo=geo, period=period)


def parse_start_year(time_bucket: str) -> int:
    match = re.search(r"\d{3,4}", time_bucket)
    if match is None:
        raise ValueError(f"Could not parse start year from time bucket: {time_bucket}")
    return int(match.group(0))


def read_source(path: Path, source_key: SourceKey) -> list[TimeRow]:
    distribution_column = DISTRIBUTION_COLUMN_BY_GEO[source_key.geo]
    rows: list[TimeRow] = []

    with path.open("r", encoding="utf-8-sig", newline="") as csv_file:
        reader = csv.DictReader(csv_file)
        required_columns = {"time_bucket", distribution_column}
        missing_columns = required_columns.difference(reader.fieldnames or [])
        if missing_columns:
            raise ValueError(f"{path.name} is missing columns: {sorted(missing_columns)}")

        for raw_row in reader:
            label = (raw_row.get("time_bucket") or "").strip()
            raw_distribution = (raw_row.get(distribution_column) or "{}").strip() or "{}"
            distribution = json.loads(raw_distribution)
            rows.append(
                TimeRow(
                    label=label,
                    start_year=parse_start_year(label),
                    values={name: int(count) for name, count in distribution.items()},
                )
            )

    return sorted(rows, key=lambda row: row.start_year)


def discover_sources() -> tuple[dict[SourceKey, list[TimeRow]], dict[str, set[str]]]:
    sources: dict[SourceKey, list[TimeRow]] = {}
    entities_by_geo: dict[str, set[str]] = {
        "country": set(),
        "continent": set(),
    }

    for path in sorted(INPUT_DIR.glob("*.csv")):
        source_key = parse_source_key(path)
        rows = read_source(path, source_key)
        sources[source_key] = rows
        for row in rows:
            entities_by_geo[source_key.geo].update(row.values)

    expected_sources = {
        SourceKey(metric=metric, geo=geo, period=period)
        for metric in ("artists", "artworks")
        for geo in ("country", "continent")
        for period in ("5year", "decade")
    }
    missing_sources = expected_sources.difference(sources)
    if missing_sources:
        missing_names = [
            f"{source.metric}_{source.geo}_{source.period}_explore.csv"
            for source in sorted(missing_sources, key=lambda item: (item.metric, item.geo, item.period))
        ]
        raise FileNotFoundError(f"Missing expected explore CSV files: {missing_names}")

    return sources, entities_by_geo


def safe_filename(name: str) -> str:
    sanitized = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", name).strip().strip(".")
    sanitized = re.sub(r"\s+", " ", sanitized)
    return sanitized or "unknown"


def prepare_output_dirs() -> dict[tuple[str, str], Path]:
    output_dirs: dict[tuple[str, str], Path] = {}
    for metric in ("artists", "artworks"):
        for period in ("5year", "decade"):
            output_dir = OUTPUT_DIR / f"{metric}_{period}"
            output_dir.mkdir(parents=True, exist_ok=True)
            for old_png in output_dir.glob("*.png"):
                try:
                    old_png.unlink()
                except PermissionError:
                    # Windows can temporarily lock images shown in previews. The chart
                    # writer below can still overwrite most locked-for-delete files.
                    pass
            output_dirs[(metric, period)] = output_dir
    return output_dirs


def output_path_for_entity(
    output_dir: Path,
    entity: str,
    geo: str,
    used_names: set[str],
) -> Path:
    base_name = safe_filename(entity)
    file_name = f"{base_name}.png"

    if file_name.lower() in used_names:
        file_name = f"{base_name}_{geo}.png"

    suffix = 2
    while file_name.lower() in used_names:
        file_name = f"{base_name}_{geo}_{suffix}.png"
        suffix += 1

    used_names.add(file_name.lower())
    return output_dir / file_name


def plot_entity_series(
    rows: list[TimeRow],
    entity: str,
    geo: str,
    metric: str,
    period: str,
    output_path: Path,
) -> None:
    x_values = [row.start_year for row in rows]
    y_values = [row.values.get(entity, 0) for row in rows]
    max_value = max(y_values, default=0)

    fig, ax = plt.subplots(figsize=(14, 6), dpi=160)
    fig.patch.set_alpha(0)
    ax.set_facecolor("none")

    ax.plot(
        x_values,
        y_values,
        color=COLOR_BY_GEO[geo],
        linewidth=2.2,
        marker="o",
        markersize=3.4,
        label=entity,
    )

    ax.set_title(entity, pad=12)
    ax.set_xlabel("Time")
    ax.set_ylabel(Y_LABEL_BY_METRIC[metric])
    ax.set_ylim(bottom=0, top=max_value * 1.08 if max_value > 0 else 1)

    first_tick = (min(x_values) // 10) * 10
    last_tick = (max(x_values) // 10) * 10
    x_ticks = list(range(first_tick, last_tick + 10, 10))
    ax.set_xticks(x_ticks)
    ax.set_xticklabels(
        [str(tick) for tick in x_ticks],
        rotation=45,
        ha="right",
        rotation_mode="anchor",
    )
    ax.yaxis.set_major_locator(MaxNLocator(integer=True))
    ax.grid(True, color="#8a8a8a", alpha=0.22, linewidth=0.8)

    legend = ax.legend(loc="upper left", frameon=True)
    legend.get_frame().set_facecolor("none")
    legend.get_frame().set_edgecolor("none")
    legend.get_frame().set_alpha(0)

    fig.tight_layout()
    fig.savefig(
        output_path,
        format="png",
        transparent=True,
        facecolor="none",
        edgecolor="none",
        bbox_inches="tight",
        pad_inches=0.12,
    )
    plt.close(fig)


def generate_charts() -> int:
    sources, entities_by_geo = discover_sources()
    output_dirs = prepare_output_dirs()
    total_charts = 0

    for metric in ("artists", "artworks"):
        for period in ("5year", "decade"):
            output_dir = output_dirs[(metric, period)]
            used_names: set[str] = set()

            for geo in ("country", "continent"):
                source_key = SourceKey(metric=metric, geo=geo, period=period)
                rows = sources[source_key]
                for entity in sorted(entities_by_geo[geo]):
                    output_path = output_path_for_entity(output_dir, entity, geo, used_names)
                    plot_entity_series(
                        rows=rows,
                        entity=entity,
                        geo=geo,
                        metric=metric,
                        period=period,
                        output_path=output_path,
                    )
                    total_charts += 1

    return total_charts


def main() -> None:
    total_charts = generate_charts()
    print(f"Generated {total_charts} transparent line charts in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
