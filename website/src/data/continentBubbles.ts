export interface ContinentBubble {
  continent: string;
  category: 'Artist' | 'Artwork';
  imageUrl: string;
}

export const continentBubbles: ContinentBubble[] = [
    {
        "continent":  "Africa",
        "category":  "Artist",
        "imageUrl":  "/Continent_bubble/Artist/Africa_artist_bubble.png"
    },
    {
        "continent":  "Africa",
        "category":  "Artwork",
        "imageUrl":  "/Continent_bubble/Artwork/Africa_artwork_bubble.png"
    },
    {
        "continent":  "Asia",
        "category":  "Artist",
        "imageUrl":  "/Continent_bubble/Artist/Asia_artist_bubble.png"
    },
    {
        "continent":  "Asia",
        "category":  "Artwork",
        "imageUrl":  "/Continent_bubble/Artwork/Asia_artwork_bubble.png"
    },
    {
        "continent":  "Europe",
        "category":  "Artist",
        "imageUrl":  "/Continent_bubble/Artist/Europe_artist_bubble.png"
    },
    {
        "continent":  "Europe",
        "category":  "Artwork",
        "imageUrl":  "/Continent_bubble/Artwork/Europe_artwork_bubble.png"
    },
    {
        "continent":  "North America",
        "category":  "Artist",
        "imageUrl":  "/Continent_bubble/Artist/North_America_artist_bubble.png"
    },
    {
        "continent":  "North America",
        "category":  "Artwork",
        "imageUrl":  "/Continent_bubble/Artwork/North_America_artwork_bubble.png"
    },
    {
        "continent":  "Oceania",
        "category":  "Artist",
        "imageUrl":  "/Continent_bubble/Artist/Oceania_artist_bubble.png"
    },
    {
        "continent":  "Oceania",
        "category":  "Artwork",
        "imageUrl":  "/Continent_bubble/Artwork/Oceania_artwork_bubble.png"
    },
    {
        "continent":  "South America",
        "category":  "Artist",
        "imageUrl":  "/Continent_bubble/Artist/South_America_artist_bubble.png"
    },
    {
        "continent":  "South America",
        "category":  "Artwork",
        "imageUrl":  "/Continent_bubble/Artwork/South_America_artwork_bubble.png"
    }
];

export const getContinentBubble = (continent: string, category: ContinentBubble['category']): ContinentBubble | undefined =>
  continentBubbles.find(item => item.continent === continent && item.category === category);