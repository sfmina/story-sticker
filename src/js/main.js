// var paywall = require("./lib/paywall");
// setTimeout(() => paywall(12345678), 5000);

//added sidechain 
// import Sidechain from '@nprapps/sidechain';
// const guest = Sidechain.registerGuest({ sentinel: 'st' });

// guest.sendMessage({
//   type: 'analytics',
//   eventCategory: 'interaction',
//   eventAction: 'click',
//   eventLabel: 'etc'
// })
//end sidechain

const fs = require('fs');
const natural = require('natural');

// Function to load the story from a text file
function loadStory(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}

// Function to load the list of photos and captions from a JSON file
function loadPhotos(photoFile) {
    return JSON.parse(fs.readFileSync(photoFile, 'utf-8'));
}

// Function to calculate similarity between two texts
function calculateSimilarity(text1, text2) {
    const tokenizer = new natural.WordTokenizer();
    const words1 = tokenizer.tokenize(text1.toLowerCase());
    const words2 = tokenizer.tokenize(text2.toLowerCase());
    
    const intersection = words1.filter(word => words2.includes(word)).length;
    const union = new Set([...words1, ...words2]).size;
    
    return union === 0 ? 0 : intersection / union;
}

// Function to analyze story paragraphs and find relevant placements for photos
function findRelevantParagraphs(story, captions) {
    const paragraphs = story.split('\n'); // Splitting story into paragraphs
    let relevanceMap = {};

    paragraphs.forEach((para, index) => {
        console.log(`\nAnalyzing paragraph ${index}: ${para}`);

        captions.forEach(photo => {
            const similarity = calculateSimilarity(para, photo.caption);
            console.log(`  Comparing with caption: "${photo.caption}"`);
            console.log(`  Similarity score: ${similarity}`);

            if (similarity > 0.15) { // Lower threshold for better matching
                if (!relevanceMap[index]) {
                    relevanceMap[index] = [];
                }
                relevanceMap[index].push(photo);
            }
        });
    });

    console.log("\nFinal relevanceMap:", JSON.stringify(relevanceMap, null, 2));
    return relevanceMap;
}


// Function to insert suggested photo placements into the story
function insertPhotoRecommendations(story, relevanceMap) {
    const paragraphs = story.split('\n');
    let modifiedStory = [];
    
    paragraphs.forEach((para, index) => {
        modifiedStory.push(para);
        if (relevanceMap[index]) {
            relevanceMap[index].forEach(photo => {
                modifiedStory.push(`\n[Suggested Image: ${photo.photo} - ${photo.caption}]\n`);
            });
        }
    });
    
    return modifiedStory.join('\n');
}

// Main function to execute the script
function main() {
    const storyFile = "story.txt";
    const photoFile = "photos.json";
    const outputFile = "output.txt";
    
    const story = loadStory(storyFile);
    const photos = loadPhotos(photoFile);
    const relevanceMap = findRelevantParagraphs(story, photos);
    const updatedStory = insertPhotoRecommendations(story, relevanceMap);
    
    fs.writeFileSync(outputFile, updatedStory, 'utf-8');
    console.log(`Processed story saved to ${outputFile}`);
    
}

// Run the script
main();
