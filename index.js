import puppeteerExtra from 'puppeteer-extra';
import stealthPluggin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

function randomInt(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function isCapital(word){
    return word.charAt(0) === word.charAt(0).toUpperCase()
}

const CreateQuote = async (page, index) => {
    await page.goto('https://www.shopify.com/blog/motivational-quotes');
    await page.waitForXPath(`//ol[${index}]/li`);
    const quoteArray = await page.$x(`//ol[${index}]/li`);
    var quoteNumber = randomInt(0, quoteArray.length - 1);
    const quote = quoteArray[quoteNumber];
    let quoteText = await page.evaluate(el => el.textContent, quote);
    quoteText = quoteText.replace("“", '"').replace('”', '"');
    var quoteTextArray = quoteText.split('"');
    var finalText = quoteTextArray[1];
    return finalText;
}

const AddReplacableWords = (arr, quote, type) => {
    let replaceArray = fs.readFileSync(`replacable${type}.txt`).toString().split('\r\n');
    var startLetter = type.substring(0, 1);
    replaceArray.forEach(word => {
        if(quote.includes(word)) {
            arr.push(startLetter + word); 
        }
    });
    return arr;
}

const CreateReplaceArray = (quoteArray) => {
    let arr = [];
    arr = AddReplacableWords(arr, quoteArray, "Nouns");
    arr = AddReplacableWords(arr, quoteArray, "Verbs");
    arr = AddReplacableWords(arr, quoteArray, "Adjectives");
    return arr;
}

const PasteText = async (page) => {
    await page.waitForTimeout(2000);
    await page.keyboard.down('Control')
    await page.keyboard.press('V')
    await page.keyboard.up('Control')
}

const CopyText = async (page) => {
    await page.waitForTimeout(2000);
    await page.keyboard.down('Control')
    await page.keyboard.press('C')
    await page.keyboard.up('Control')
}

const ClickElement = async (page, path) => {
    await page.waitForXPath(path);
    var [ele] = await page.$x(path);
    await page.waitForTimeout(750);
    await ele.click();
    await page.waitForTimeout(750);
}

const SearchInput = async (page, searchTerm, path) => {
    const [searchBar] = await page.$x(path);
    await searchBar.type(searchTerm);
    await page.waitForTimeout(750);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(750);
}
const TypeElement = async (page, text, path) => {
    await page.waitForXPath(path);
    var [ele] = await page.$x(path);
    await page.waitForTimeout(750);
    await ele.type(text);
    await page.waitForTimeout(750);
}

const CopyQuoteToBrowser = async (page, quote) => {
    await page.goto('https://www.google.com/');
    const [searchBar] = await page.$x('//form[@action="/search"]/div[1]/div[1]/div[1]/div/div[2]/input');
    await searchBar.type(quote);
    await searchBar.click({clickCount: 3});
    await page.waitForTimeout(3000)
    await CopyText(page);
}

const EditImage = async (page, browser) => {
    await page.goto('https://www.befunky.com/create/photo-editor/');
    await page.waitForTimeout(3000);
    await ClickElement(page, '//div[@class="top-nav__inner top-nav__center"]/dropdown-menu[1]/button') //Open Button
    await ClickElement(page, '//div[@class="top-nav__inner top-nav__center"]/dropdown-menu[1]/div/div') //More Button
    await ClickElement(page, '//div[@class="top-nav__inner top-nav__center"]/dropdown-menu[1]/div/div/div/div/button[1]') //Stock Images Button
    await SearchInput(page, 'inspiration', '//div[@class="stock-search__left-panel"]/form/input');
    var rowNumber = randomInt(1,6);
    var imageNumber = randomInt(1, 3);
    await ClickElement(page, `//div[@class="gallery__items"]/div[${rowNumber}]/div[${imageNumber}]/div[1]`) //Default Image
    await page.waitForTimeout(8000); //Wait for image to load
    await ClickElement(page, '//nav[@id="primary-panel"]/div[1]/button[9]') //Add Text
    await PasteText(page);
    await ClickElement(page, '//multimedia-clue[@id="multimedia_clue_haunted"]/panel-header/button[3]') //Close Button
    await SearchInput(page, '120', '//div[@id="text_edit_size"]/input') //Text Size Input
    await ClickElement(page, '//toggle-group[@id="text_edit_align"]/button[2]') //Text Align Button
    await ClickElement(page, '//div[@id="transform_menu_controls"]/button[3]') //Options Button
    await ClickElement(page, '//div[@id="transform_menu_popover"]/div[2]/div[4]/button[6]') //Justify Center
    await ClickElement(page, '//expandable-checkbox[@id="text_edit_stroke_enabled"]/div[1]/button[1]') //Outline Button
    await ClickElement(page, '//expandable-checkbox[@id="text_edit_stroke_enabled"]/div[2]/div/div[1]/div/button') //Color Changer
    await ClickElement(page, '//input[@aria-label="Input Color"]') //Color Input
    await SearchInput(page, 'FFFFFF', '//input[@aria-label="Input Color"]') //Color Input
    await ClickElement(page, '//top-nav/div[2]/dropdown-menu[2]/button') //Save Button
    await ClickElement(page, '//top-nav/div[2]/dropdown-menu[2]/div/div') //More Button
    await ClickElement(page, '//top-nav/div[2]/dropdown-menu[2]/div/div/div/div/button[4]') //Twitter Button
    await ClickElement(page, '//div[@id="modal_root"]/div[2]/div/div/div/div/button[2]') //OK Button
    await TypeElement(page, 'Email', '//input[@id="sign_in_form_email"]') //Email Input
    await TypeElement(page, 'Password', '//input[@id="sign_in_form_password"]') //Password Input
    await ClickElement(page, '//form[@id="sign_in_form"]/button') //Submit Form

    await ClickElement(page, '//top-nav/div[2]/dropdown-menu[2]/button') //Save Button
    await ClickElement(page, '//top-nav/div[2]/dropdown-menu[2]/div/div') //More Button
    await ClickElement(page, '//top-nav/div[2]/dropdown-menu[2]/div/div/div/div/button[4]') //Twitter Button
    await TypeElement(page, 'so inspirational', '//div[@id="sas_caption_area"]/textarea-counter/div/textarea') //Caption Textarea
    await ClickElement(page, '//button[@id="sas_share"]') //Share    

    //save target of original page to know that this was the opener:     
    const pageTarget = page.target();
    //execute click on first tab that triggers opening of new tab:
    await ClickElement(page, '//div[@id="bfn-app"]/div[3]/div[4]/div/div/div/div/button[2]') //Ok Button
    //check that the first page opened this new page:
    const newTarget = await browser.waitForTarget(target => target.opener() === pageTarget);
    //get the new page object:
    const newPage = await newTarget.page();
    await TypeElement(newPage, 'inspirebot3', '//form[@action="/sessions"]/div/div[1]/label/div/div[2]/div/input');
    await TypeElement(newPage, 'Password', '//form[@action="/sessions"]/div/div[2]/label/div/div[2]/div/input');
    await ClickElement(newPage, '//div[@id="layers"]/div[3]/div/div/div/div/div/div[2]/div[2]/div/div[2]/div[2]');
    await ClickElement(newPage, '//div[@id="layers"]/div[2]/div/div/div/div/div/div[2]/div[2]/div/div/div/div[3]/div/div[1]/div/div/div/div/div[2]/div[3]/div/div/div[2]/div[4]');
}

const FinalizeQuote = (quote) => {
    let quoteWordArray = quote.split(" ");
    let replaceArray = CreateReplaceArray(quoteWordArray);
    let subArray = [];
    var replacedAmount = Math.min(replaceArray.length, 2);
    for(var i = 0; i < replacedAmount; i++) {
        var item = replaceArray[Math.floor(Math.random()*replaceArray.length)];
        while(subArray.includes(item)) {
            var item = replaceArray[Math.floor(Math.random()*replaceArray.length)];
        }
        subArray.push(item);
    }
    
    let arrayTypeN = fs.readFileSync('nouns.txt').toString().split('\r\n');
    let arrayTypeV = fs.readFileSync('verbs.txt').toString().split('\r\n');
    let arrayTypeA = fs.readFileSync('adjectives.txt').toString().split('\r\n');

    subArray.forEach(sub => {
        var prefix = sub.substring(0, 1);
        var currentArray = eval("arrayType" + prefix);
        var randomWord = currentArray[Math.floor(Math.random()*currentArray.length)];
        sub = sub.replace(prefix, "");
        if(!isCapital(sub)) randomWord = randomWord.toLowerCase();
        quote = quote.replace(sub, randomWord)
    });
    return quote;
}

//Main Function
const TweetInspiration = async () => {
    puppeteerExtra.use(stealthPluggin());
    const browser = await puppeteerExtra.launch({ headless: false });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    var quoteListIndex = randomInt(2, 8);
    let quote = await CreateQuote(page, quoteListIndex);
    quote = FinalizeQuote(quote);
    console.log(quote);
    await CopyQuoteToBrowser(page, quote);
    await EditImage(page, browser)
}

TweetInspiration();