from __future__ import annotations

import csv
import json
from collections import Counter, defaultdict
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[3]
ARTWORKS_INPUT_PATH = ROOT_DIR / "data" / "cleaned_artworks.csv"
ARTISTS_INPUT_PATH = ROOT_DIR / "data" / "cleaned_artists.csv"
OUTPUT_DIR = ROOT_DIR / "data" / "distribution"
EXPLORE_OUTPUT_DIR = OUTPUT_DIR / "explore"
NATIONALITY_TO_CONTINENT = {
    "Afghan": "Asia",
    "Albanian": "Europe",
    "Algerian": "Africa",
    "American": "North America",
    "Argentine": "South America",
    "Australian": "Oceania",
    "Austrian": "Europe",
    "Azerbaijani": "Asia",
    "Bahamian": "North America",
    "Bangladeshi": "Asia",
    "Belgian": "Europe",
    "Beninese": "Africa",
    "Bolivian": "South America",
    "Bosnian": "Europe",
    "Brazilian": "South America",
    "British": "Europe",
    "Bulgarian": "Europe",
    "Burkinabe": "Africa",
    "Cambodian": "Asia",
    "Cameroonian": "Africa",
    "Canadian": "North America",
    "Canadian Inuit": "North America",
    "Chilean": "South America",
    "Chinese": "Asia",
    "Colombian": "South America",
    "Congolese": "Africa",
    "Costa Rican": "North America",
    "Croatian": "Europe",
    "Cuban": "North America",
    "Cypriot": "Asia",
    "Czech": "Europe",
    "Czechoslovakian": "Europe",
    "Danish": "Europe",
    "Dutch": "Europe",
    "Ecuadorian": "South America",
    "Egyptian": "Africa",
    "Emirati": "Asia",
    "Estonian": "Europe",
    "Ethiopian": "Africa",
    "Filipino": "Asia",
    "Finnish": "Europe",
    "French": "Europe",
    "Georgian": "Asia",
    "German": "Europe",
    "Ghanaian": "Africa",
    "Greek": "Europe",
    "Guatemalan": "North America",
    "Guyanese": "South America",
    "Haitian": "North America",
    "Hungarian": "Europe",
    "Icelandic": "Europe",
    "Indian": "Asia",
    "Iranian": "Asia",
    "Irish": "Europe",
    "Israeli": "Asia",
    "Italian": "Europe",
    "Ivorian": "Africa",
    "Japanese": "Asia",
    "Kazakhstani": "Asia",
    "Kenyan": "Africa",
    "Korean": "Asia",
    "Kuwaiti": "Asia",
    "Kyrgyzstani": "Asia",
    "Latvian": "Europe",
    "Lebanese": "Asia",
    "Lithuanian": "Europe",
    "Luxembourgish": "Europe",
    "Macedonian": "Europe",
    "Malaysian": "Asia",
    "Malian": "Africa",
    "Mexican": "North America",
    "Moroccan": "Africa",
    "Namibian": "Africa",
    "Native American": "North America",
    "New Zealander": "Oceania",
    "Nicaraguan": "North America",
    "Nigerian": "Africa",
    "Norwegian": "Europe",
    "Pakistani": "Asia",
    "Palestinian": "Asia",
    "Panamanian": "North America",
    "Paraguayan": "South America",
    "Peruvian": "South America",
    "Polish": "Europe",
    "Portuguese": "Europe",
    "Romanian": "Europe",
    "Russian": "Europe",
    "Salvadoran": "North America",
    "Scottish": "Europe",
    "Senegalese": "Africa",
    "Serbian": "Europe",
    "Sierra Leonean": "Africa",
    "Singaporean": "Asia",
    "Slovak": "Europe",
    "Slovenian": "Europe",
    "South African": "Africa",
    "Spanish": "Europe",
    "Sudanese": "Africa",
    "Swedish": "Europe",
    "Swiss": "Europe",
    "Taiwanese": "Asia",
    "Tanzanian": "Africa",
    "Thai": "Asia",
    "Turkish": "Asia",
    "Ugandan": "Africa",
    "Ukrainian": "Europe",
    "Uruguayan": "South America",
    "Venezuelan": "South America",
    "Vietnamese": "Asia",
    "Welsh": "Europe",
    "Yugoslav": "Europe",
    "Zimbabwean": "Africa",
}


def build_summary(
    input_path: Path,
    year_field: str,
    category_field: str,
    value_resolver,
    allowed_categories: list[str] | None = None,
) -> tuple[list[str], list[str], list[dict[str, object]]]:
    categories: set[str] = set()
    decade_totals: Counter[int] = Counter()
    category_totals: dict[int, Counter[str]] = defaultdict(Counter)
    dimension_totals: dict[int, dict[str, Counter[str]]] = defaultdict(
        lambda: defaultdict(Counter)
    )

    with input_path.open("r", encoding="utf-8-sig", newline="") as input_file:
        reader = csv.DictReader(input_file)
        for row in reader:
            year = int((row.get(year_field) or "").strip())
            decade = (year // 10) * 10
            category = (row.get(category_field) or "").strip()
            if allowed_categories is not None and category not in allowed_categories:
                continue
            nationality = (row.get("Nationality") or "").strip()
            resolved_value = value_resolver(nationality)

            categories.add(category)
            decade_totals[decade] += 1
            category_totals[decade][category] += 1
            dimension_totals[decade][category][resolved_value] += 1

    if allowed_categories is None:
        ordered_categories = sorted(categories)
    else:
        ordered_categories = [category for category in allowed_categories if category in categories]
    start_decade = min(decade_totals)
    end_decade = max(decade_totals)

    header = ["decade", "all_artwork_num"]
    for category in ordered_categories:
        header.append(f"{category}_total")
        header.append(f"{category}_nationalities")

    rows: list[dict[str, object]] = []
    for decade in range(start_decade, end_decade + 10, 10):
        row: dict[str, object] = {
            "decade": f"{decade}s",
            "all_artwork_num": decade_totals.get(decade, 0),
        }

        for category in ordered_categories:
            total = category_totals[decade].get(category, 0)
            row[f"{category}_total"] = total

            ranked_values = sorted(
                dimension_totals[decade][category].items(),
                key=lambda item: (-item[1], item[0]),
            )
            row[f"{category}_nationalities"] = {
                value: count for value, count in ranked_values
            }

        rows.append(row)

    return header, ordered_categories, rows


def build_json_payload(
    rows: list[dict[str, object]],
    categories: list[str],
    category_key: str,
    distribution_key: str,
    total_key: str,
) -> dict[str, object]:
    decades: list[dict[str, object]] = []
    for row in rows:
        decade_entry = {
            "decade": row["decade"],
            total_key: row["all_artwork_num"],
            category_key: {},
        }

        for category in categories:
            decade_entry[category_key][category] = {
                "total": row[f"{category}_total"],
                distribution_key: row[f"{category}_nationalities"],
            }

        decades.append(decade_entry)

    return {
        category_key: categories,
        "decades": decades,
    }


def write_distribution(
    input_path: Path,
    year_field: str,
    category_field: str,
    output_stem: str,
    category_key: str,
    distribution_key: str,
    total_key: str,
    value_resolver,
    allowed_categories: list[str] | None = None,
) -> None:
    header, categories, rows = build_summary(
        input_path=input_path,
        year_field=year_field,
        category_field=category_field,
        value_resolver=value_resolver,
        allowed_categories=allowed_categories,
    )
    csv_output_path = OUTPUT_DIR / f"{output_stem}.csv"
    json_output_path = OUTPUT_DIR / f"{output_stem}.json"
    csv_rows: list[dict[str, str]] = []
    for row in rows:
        csv_row: dict[str, str] = {
            "decade": str(row["decade"]),
            total_key: str(row["all_artwork_num"]),
        }
        for category in categories:
            csv_row[f"{category}_total"] = str(row[f"{category}_total"])
            csv_row[f"{category}_{distribution_key}"] = json.dumps(
                row[f"{category}_nationalities"],
                ensure_ascii=False,
                separators=(",", ":"),
            )
        csv_rows.append(csv_row)

    csv_header = ["decade", total_key]
    for category in categories:
        csv_header.append(f"{category}_total")
        csv_header.append(f"{category}_{distribution_key}")

    with csv_output_path.open("w", encoding="utf-8-sig", newline="") as output_file:
        writer = csv.DictWriter(output_file, fieldnames=csv_header)
        writer.writeheader()
        writer.writerows(csv_rows)

    json_payload = build_json_payload(
        rows=rows,
        categories=categories,
        category_key=category_key,
        distribution_key=distribution_key,
        total_key=total_key,
    )
    with json_output_path.open("w", encoding="utf-8-sig", newline="") as output_file:
        json.dump(json_payload, output_file, ensure_ascii=False, indent=2)

    print(f"Wrote {len(rows)} decades to {csv_output_path}")
    print(f"Wrote JSON payload to {json_output_path}")


def format_time_bucket(bucket_start: int, bucket_size: int) -> str:
    if bucket_size == 10:
        return f"{bucket_start}s"
    return f"{bucket_start}-{bucket_start + bucket_size - 1}"


def build_explore_summary(
    input_path: Path,
    year_field: str,
    total_key: str,
    distribution_key: str,
    value_resolver,
    bucket_size: int,
) -> list[dict[str, object]]:
    bucket_totals: Counter[int] = Counter()
    distribution_totals: dict[int, Counter[str]] = defaultdict(Counter)

    with input_path.open("r", encoding="utf-8-sig", newline="") as input_file:
        reader = csv.DictReader(input_file)
        for row in reader:
            year = int((row.get(year_field) or "").strip())
            bucket_start = (year // bucket_size) * bucket_size
            resolved_value = value_resolver((row.get("Nationality") or "").strip())

            bucket_totals[bucket_start] += 1
            distribution_totals[bucket_start][resolved_value] += 1

    start_bucket = min(bucket_totals)
    end_bucket = max(bucket_totals)
    rows: list[dict[str, object]] = []
    for bucket_start in range(start_bucket, end_bucket + bucket_size, bucket_size):
        ranked_values = sorted(
            distribution_totals[bucket_start].items(),
            key=lambda item: (-item[1], item[0]),
        )
        rows.append(
            {
                "time_bucket": format_time_bucket(bucket_start, bucket_size),
                total_key: bucket_totals.get(bucket_start, 0),
                distribution_key: {
                    value: count for value, count in ranked_values
                },
            }
        )

    return rows


def write_explore_distribution(
    input_path: Path,
    year_field: str,
    output_stem: str,
    total_key: str,
    distribution_key: str,
    value_resolver,
    bucket_size: int,
) -> None:
    rows = build_explore_summary(
        input_path=input_path,
        year_field=year_field,
        total_key=total_key,
        distribution_key=distribution_key,
        value_resolver=value_resolver,
        bucket_size=bucket_size,
    )
    csv_output_path = EXPLORE_OUTPUT_DIR / f"{output_stem}.csv"
    json_output_path = EXPLORE_OUTPUT_DIR / f"{output_stem}.json"

    with csv_output_path.open("w", encoding="utf-8-sig", newline="") as output_file:
        writer = csv.DictWriter(
            output_file,
            fieldnames=["time_bucket", total_key, distribution_key],
        )
        writer.writeheader()
        for row in rows:
            writer.writerow(
                {
                    "time_bucket": row["time_bucket"],
                    total_key: row[total_key],
                    distribution_key: json.dumps(
                        row[distribution_key],
                        ensure_ascii=False,
                        separators=(",", ":"),
                    ),
                }
            )

    with json_output_path.open("w", encoding="utf-8-sig", newline="") as output_file:
        json.dump({"time_buckets": rows}, output_file, ensure_ascii=False, indent=2)

    print(f"Wrote {len(rows)} buckets to {csv_output_path}")
    print(f"Wrote JSON payload to {json_output_path}")


def resolve_nationality_as_country(nationality: str) -> str:
    return nationality


def resolve_nationality_as_continent(nationality: str) -> str:
    try:
        return NATIONALITY_TO_CONTINENT[nationality]
    except KeyError as exc:
        raise KeyError(f"Missing continent mapping for nationality: {nationality}") from exc


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    EXPLORE_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    write_distribution(
        input_path=ARTWORKS_INPUT_PATH,
        year_field="Date",
        category_field="Classification",
        output_stem="artworks_country_distribution",
        category_key="classifications",
        distribution_key="nationalities",
        total_key="all_artwork_num",
        value_resolver=resolve_nationality_as_country,
    )
    write_distribution(
        input_path=ARTWORKS_INPUT_PATH,
        year_field="Date",
        category_field="Classification",
        output_stem="artworks_continent_distribution",
        category_key="classifications",
        distribution_key="continents",
        total_key="all_artwork_num",
        value_resolver=resolve_nationality_as_continent,
    )
    write_distribution(
        input_path=ARTISTS_INPUT_PATH,
        year_field="BeginDate",
        category_field="Gender",
        output_stem="artists_country_distribution",
        category_key="genders",
        distribution_key="nationalities",
        total_key="all_artist_num",
        value_resolver=resolve_nationality_as_country,
        allowed_categories=["Male", "Female"],
    )
    write_distribution(
        input_path=ARTISTS_INPUT_PATH,
        year_field="BeginDate",
        category_field="Gender",
        output_stem="artists_continent_distribution",
        category_key="genders",
        distribution_key="continents",
        total_key="all_artist_num",
        value_resolver=resolve_nationality_as_continent,
        allowed_categories=["Male", "Female"],
    )
    write_explore_distribution(
        input_path=ARTWORKS_INPUT_PATH,
        year_field="Date",
        output_stem="artworks_country_decade_explore",
        total_key="all_artwork_num",
        distribution_key="nationalities",
        value_resolver=resolve_nationality_as_country,
        bucket_size=10,
    )
    write_explore_distribution(
        input_path=ARTWORKS_INPUT_PATH,
        year_field="Date",
        output_stem="artworks_country_5year_explore",
        total_key="all_artwork_num",
        distribution_key="nationalities",
        value_resolver=resolve_nationality_as_country,
        bucket_size=5,
    )
    write_explore_distribution(
        input_path=ARTWORKS_INPUT_PATH,
        year_field="Date",
        output_stem="artworks_continent_decade_explore",
        total_key="all_artwork_num",
        distribution_key="continents",
        value_resolver=resolve_nationality_as_continent,
        bucket_size=10,
    )
    write_explore_distribution(
        input_path=ARTWORKS_INPUT_PATH,
        year_field="Date",
        output_stem="artworks_continent_5year_explore",
        total_key="all_artwork_num",
        distribution_key="continents",
        value_resolver=resolve_nationality_as_continent,
        bucket_size=5,
    )
    write_explore_distribution(
        input_path=ARTISTS_INPUT_PATH,
        year_field="BeginDate",
        output_stem="artists_country_decade_explore",
        total_key="all_artist_num",
        distribution_key="nationalities",
        value_resolver=resolve_nationality_as_country,
        bucket_size=10,
    )
    write_explore_distribution(
        input_path=ARTISTS_INPUT_PATH,
        year_field="BeginDate",
        output_stem="artists_country_5year_explore",
        total_key="all_artist_num",
        distribution_key="nationalities",
        value_resolver=resolve_nationality_as_country,
        bucket_size=5,
    )
    write_explore_distribution(
        input_path=ARTISTS_INPUT_PATH,
        year_field="BeginDate",
        output_stem="artists_continent_decade_explore",
        total_key="all_artist_num",
        distribution_key="continents",
        value_resolver=resolve_nationality_as_continent,
        bucket_size=10,
    )
    write_explore_distribution(
        input_path=ARTISTS_INPUT_PATH,
        year_field="BeginDate",
        output_stem="artists_continent_5year_explore",
        total_key="all_artist_num",
        distribution_key="continents",
        value_resolver=resolve_nationality_as_continent,
        bucket_size=5,
    )


if __name__ == "__main__":
    main()
