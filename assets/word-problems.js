const WP_NAMES = ["Riya", "Rahul", "Sam", "Tina", "Arjun", "Zara", "Leo", "Maya", "Rohan", "Priya"];
const WP_OBJECTS = ["apple", "ball", "chocolate", "book", "pencil", "flower", "cookie", "coin"];
const WP_ANIMALS = ["bird", "cat", "dog", "ant", "spider"];

const WP_TEMPLATES = {
    addition: [
        "{Name} has {N1} {obj}s. {Name2} gives {him/her} {N2} more. How many {obj}s does {Name} have now?",
        "There are {N1} red {obj}s and {N2} blue {obj}s. How many {obj}s are there in total?",
        "{Name} read {N1} pages yesterday and {N2} pages today. How many pages did {he/she} read in total?",
        "A shop sold {N1} {obj}s in the morning and {N2} in the evening. Total {obj}s sold?"
    ],
    subtraction: [
        "{Name} had {N1} {obj}s. {He/She} gave {N2} to a friend. How many {obj}s are left?",
        "There were {N1} {animal}s on a tree. {N2} flew away. How many {animal}s remain?",
        "{Name} bought {N1} {obj}s but lost {N2} of them. How many does {he/she} have now?",
        "A box had {N1} {obj}s. {Name} took {N2} out. How many are left in the box?"
    ],
    multiplication: [
        "There are {N1} bags. Each bag has {N2} {obj}s. How many {obj}s in total?",
        "One box holds {N2} {obj}s. How many {obj}s are in {N1} boxes?",
        "A {animal} has {N2} legs. How many legs do {N1} {animal}s have?",
        "{Name} studies for {N2} hours every day. How many hours does {he/she} study in {N1} days?"
    ],
    division: [
        "{N1} {obj}s are shared equally among {N2} kids. How many {obj}s does each kid get?",
        "{N1} apples are put into {N2} baskets equally. How many apples in each basket?",
        "{Name} has {N1} {obj}s. {He/She} packs them into groups of {N2}. How many packs are there?",
        "A rope is {N1} meters long. It is cut into {N2} equal pieces. Length of each piece?"
    ]
};

class WordProblemEngine {
    constructor() { }

    getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    getProblem(op, n1, n2) {
        const templates = WP_TEMPLATES[op] || WP_TEMPLATES['addition'];
        let text = this.getRandomItem(templates);

        const name1 = this.getRandomItem(WP_NAMES);
        let name2 = this.getRandomItem(WP_NAMES);
        while (name2 === name1) name2 = this.getRandomItem(WP_NAMES);

        const obj = this.getRandomItem(WP_OBJECTS);
        const animal = this.getRandomItem(WP_ANIMALS);

        // Simple gender guess based on name ending (rough heuristic for ease)
        const isGirl = name1.endsWith('a');
        const pronounSub = isGirl ? "She" : "He";
        const pronounObj = isGirl ? "her" : "him";

        text = text.replace(/{Name}/g, name1);
        text = text.replace(/{Name2}/g, name2);
        text = text.replace(/{N1}/g, n1);
        text = text.replace(/{N2}/g, n2);
        text = text.replace(/{obj}/g, obj);
        text = text.replace(/{animal}/g, animal);
        text = text.replace(/{He\/She}/g, pronounSub);
        text = text.replace(/{him\/her}/g, pronounObj);
        text = text.replace(/{he\/she}/g, pronounSub.toLowerCase());

        return text;
    }
}

window.WordProblemEngine = WordProblemEngine;
