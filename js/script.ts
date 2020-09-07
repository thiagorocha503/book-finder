const GOOGLE_API_VERSION = "1";
var inputSearch: HTMLInputElement = document.getElementById("txt-search") as HTMLInputElement;
const ENTER_KEY: number = 13

inputSearch.addEventListener("keypress", (evt: KeyboardEvent) => {
    if (evt.keyCode == ENTER_KEY) {
        onSearch();
    }
});

function search(query: string) {
    let xmlHtmlResquest: XMLHttpRequest = new XMLHttpRequest();
    xmlHtmlResquest.onreadystatechange = (evt: Event) => {
        if (xmlHtmlResquest.readyState == 4) {
            console.log("Read state 4: DONE")
            if (xmlHtmlResquest.status == 200) {
                let reponseJSON = JSON.parse(xmlHtmlResquest.responseText);
                let books = reponseJSON["totalItems"] != 0 ? reponseJSON["items"] : [];
                render(books);
            } else {
                console.log(xmlHtmlResquest)
            }
        }
    }
    xmlHtmlResquest.open("get", `https://www.googleapis.com/books/v${GOOGLE_API_VERSION}/volumes?q=${query}`)
    xmlHtmlResquest.send();
}

function onSearch() {
    inputSearch.classList.remove("is-invalid");
    let feedBack = document.getElementById("search-feedback");
    feedBack?.classList.remove("d-block")
    if (inputSearch.value == "") {
        console.log("Empty query");
        inputSearch.classList.add("is-invalid");
        feedBack?.classList.add("d-block");
        return;
    }
    search(inputSearch.value);
}

function render(books: Array<Object>) {

    let container: HTMLDivElement = document.getElementById("row-result") as HTMLDivElement;
    let oldCardList: HTMLDivElement = document.getElementById("card-list") as HTMLDivElement;
    let newCardList: HTMLDivElement = buildListCard(books);
    container.replaceChild(newCardList, oldCardList);

}

function buildListCard(books: Array<any>) {
    let cardList: HTMLDivElement = document.createElement("div");
    cardList.className = "col mb-4";
    cardList.id = "card-list";
    books.forEach((book) => {
        let card: HTMLDivElement = buildCard(book);
        cardList.appendChild(card);
    });
    return cardList;
}

function buildCard(book: any): HTMLDivElement {
    console.log(book);
    let cardContainer: HTMLDivElement = document.createElement("div");
    //${book["volumeInfo"]["imageLinks"]['thumbnail']}
    let imageLinks = book["volumeInfo"]["imageLinks"];
    cardContainer.className = "card shadow-sm mb-2";
    cardContainer.insertAdjacentHTML("afterbegin", `
        <div class="card-body d-flex">
            <div>
                <img class="fluid-img" src="${imageLinks != null ? imageLinks["smallThumbnail"] : ""}">
            </div>
            <div class="px-3 flex-grow-1">
                <h4 class="text-gray">${book["volumeInfo"]["title"]}</h4>
                <p class="text-gray text-muted">by
                    ${book["volumeInfo"]["authors"] != undefined ?
            book["volumeInfo"]["authors"].map((item: string, i: number) => item.trim()).join("") : "Unknow "
        } | 
                    ${book["volumeInfo"]["publishedDate"] == undefined ? " Unknown" : book["volumeInfo"]["publishedDate"]}</p>
                <p>
                    ${book["searchInfo"]["textSnippet"]}
                </p>
                <a href="${book["volumeInfo"]["infoLink"]}" class="btn btn-primary text-white" target="_blank" >See more</a>
            </div>
        </div>
    `);
    return cardContainer;
}