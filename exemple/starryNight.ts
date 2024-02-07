/*
Starry Night
*/
class StarryNight {
    artist: string;
    title: string;
    year: number;
    medium: string;
    description: string;
    dimensions: { width: number; height: number; };
    constructor() {
        this.title = "Starry Night";
        this.artist = "Vincent van Gogh";
        this.medium = "Oil on canvas";
        this.description = "A famous painting depicting a night sky with swirling clouds and bright stars.";
        this.dimensions = { width: 73.7, height: 92.1 }; // cm
    }

    displayInfo() {
        console.log(`Title: ${this.title}`);
    }

    async setYear(year: number) {
        this.year = year;
    }
}
const starryNight = new StarryNight();
starryNight.setYear(1889);
starryNight.displayInfo();