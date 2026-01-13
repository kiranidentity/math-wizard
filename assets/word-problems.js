const WP_NAMES = ["Riya", "Rahul", "Sam", "Tina", "Arjun", "Zara", "Leo", "Maya", "Rohan", "Priya", "Amit", "Sana", "Dev", "Eva", "Om", "Kiran", "Tara", "Vivan", "Aditi"];
const WP_OBJECTS = ["apple", "ball", "chocolate", "book", "pencil", "flower", "cookie", "coin", "marble", "sticker", "toy", "balloon", "star", "cupcake", "donut", "orange", "pen", "cap"];
const WP_ANIMALS = ["bird", "cat", "dog", "ant", "spider", "butterfly", "fish", "duck", "rabbit", "frog"];

const WP_TEMPLATES = {
    addition: [
        "{Name} has {N1} {obj}s. {Name2} gives {him/her} {N2} more. How many {obj}s does {Name} have now?",
        "There are {N1} red {obj}s and {N2} blue {obj}s in a basket. How many {obj}s are there in total?",
        "{Name} read {N1} pages yesterday and {N2} pages today. How many pages did {he/she} read in total?",
        "A shop sold {N1} {obj}s in the morning and {N2} in the evening. How many {obj}s were sold today?",
        "{Name} collected {N1} seashells on the beach. {Name2} found {N2} more. How many seashells do they have together?",
        "A bus had {N1} passengers. At the next stop, {N2} more people got on. How many people are on the bus now?",
        "In a garden, there are {N1} rose bushes and {N2} jasmine bushes. What is the total number of bushes?",
        "{Name} scored {N1} points in the first game and {N2} points in the second. What is {his/her} total score?",
        "There are {N1} boys and {N2} girls in a class. What is the total strength of the class?",
        "{Name} saved {N1} coins in a piggy bank. {He/She} added {N2} more coins today. Total coins now?",
        "A farmer has {N1} cows and {N2} sheep. How many animals does the farmer have in total?",
        "{Name} ate {N1} grapes and {Name2} ate {N2} grapes. How many grapes did they eat altogether?",
        "There are {N1} cars parked on the street and {N2} in the driveway. How many cars are there in all?",
        "A library bought {N1} new books last month and {N2} this month. How many new books were bought?",
        "{Name} grew a plant. It was {N1} cm tall last week. It grew {N2} cm more. How tall is it now?"
    ],
    subtraction: [
        "{Name} had {N1} {obj}s. {He/She} gave {N2} to a friend. How many {obj}s are left?",
        "There were {N1} {animal}s on a tree. {N2} flew away. How many {animal}s remain?",
        "{Name} bought {N1} {obj}s but lost {N2} of them. How many does {he/she} have now?",
        "A box had {N1} {obj}s. {Name} took {N2} out. How many are left in the box?",
        "A bakery made {N1} cookies. They sold {N2} of them. How many cookies are left?",
        "{Name} is reading a book with {N1} pages. {He/She} has finished {N2} pages. How many pages are left to read?",
        "There were {N1} cars in the parking lot. {N2} cars drove away. How many cars are still there?",
        "{Name} had {N1} rupees. {He/She} spent {N2} on a snack. How much money is left?",
        "A store had {N1} T-shirts. {N2} were sold today. How many T-shirts are in stock now?",
        "There are {N1} steps in a staircase. {Name} has climbed {N2}. How many steps are remaining?",
        "{Name} popped {N2} balloons out of {N1}. How many balloons are still inflated?",
        "A quiz has {N1} questions. {Name} answered {N2} correctly. How many did {he/she} miss? (Assume all answered)",
        "The temperature was {N1} degrees. It dropped by {N2} degrees. What is the temperature now?",
        "There were {N1} fish in a pond. A stork caught {N2}. How many fish survive?",
        "{Name} needs {N1} points to win. {He/She} has {N2} points. How many more points are needed?"
    ],
    multiplication: [
        "There are {N1} bags. Each bag has {N2} {obj}s. How many {obj}s are there in total?",
        "One box holds {N2} {obj}s. How many {obj}s are is inside {N1} boxes?",
        "A {animal} has {N2} legs. How many legs do {N1} {animal}s have altogether?",
        "{Name} studies for {N2} hours every day. How many hours does {he/she} study in {N1} days?",
        "A car has {N2} wheels. How many wheels do {N1} cars have?",
        "Each ticket costs {N2} dollars. How much do {N1} tickets cost?",
        "There are {N1} rows of chairs. Each row has {N2} chairs. How many chairs are there in total?",
        "A flower has {N2} petals. How many petals do {N1} such flowers have?",
        "{Name} buys {N1} packs of stickers. Each pack has {N2} stickers. Total stickers?",
        "An octopus has {N2} arms. How many arms do {N1} octopuses have?",
        "There are {N1} weeks in a project. Each week has {N2} days. Total days?",
        "{Name} runs {N2} miles every morning. How many miles does {he/she} run in {N1} days?",
        "A building has {N1} floors. Each floor has {N2} windows. Total windows?",
        "Each student gets {N2} pencils. How many pencils are needed for {N1} students?",
        "A spider has {N2} legs. How many legs do {N1} spiders have?"
    ],
    division: [
        "{N1} {obj}s are shared equally among {N2} kids. How many {obj}s does each kid get?",
        "{N1} apples are put into {N2} baskets equally. How many apples are in each basket?",
        "{Name} has {N1} {obj}s. {He/She} packs them into groups of {N2}. How many packs are there?",
        "A rope is {N1} meters long. It is cut into {N2} equal pieces. What is the length of each piece?",
        "There are {N1} students. They are divided into teams of {N2}. How many teams are formed?",
        "{Name} has {N1} rupees. A chocolate costs {N2} rupees. How many chocolates can {he/she} buy?",
        "A 30-day month is divided into weeks. If {N1} days make {N2} weeks... (Wait, this is complex). {N1} days divided by {N2}. Ans days.",
        "{N1} chairs are arranged in {N2} equal rows. How many chairs are in one row?",
        "{Name} read {N1} pages in {N2} days. If {he/she} read the same amount daily, how many pages per day?",
        "A car travels {N1} km in {N2} hours. What is the speed in km per hour?",
        "There are {N1} eggs. A carton holds {N2} eggs. How many cartons are needed?",
        "{N1} liters of juice is poured equally into {N2} glasses. How much juice in each glass?",
        "A ribbon of length {N1} cm is cut into {N2} parts. Length of one part?",
        "Total bill is {N1} dollars. {N2} friends split it properly. Share of each friend?",
        "{N1} photos are placed in an album. Each page holds {N2} photos. How many pages are used?"
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
        const isGirl = name1.endsWith('a') || ["Aditi", "Priya", "Maya", "Tina", "Eva", "Sana"].includes(name1);
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
