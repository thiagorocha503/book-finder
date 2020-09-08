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
                console.log("status: "+xmlHtmlResquest.status)
            }
        }
    }
    xmlHtmlResquest.timeout =3000;
    xmlHtmlResquest.onerror = function(evt){
        console.error("on Error> "+xmlHtmlResquest.status)
        $("#error-modal").modal("show");
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
    cardContainer.className = "card shadow-sm mb-2";
    cardContainer.insertAdjacentHTML("afterbegin", `
        <div class="card-body d-flex">
            <div style="min-width: 128px;">
                <img class="fluid-img" alt="image not available" src=${book["volumeInfo"]["imageLinks"] != undefined ? book["volumeInfo"]["imageLinks"]["smallThumbnail"] : "img/thumbnail.png"}>
            </div>
            <div class="px-3 flex-grow-1">
                <h4 class="text-gray">${book["volumeInfo"]["title"]}</h4>
                <p class="text-gray text-muted">by
                    ${book["volumeInfo"]["authors"] != undefined ?
                        book["volumeInfo"]["authors"].map((item: string, i: number) => item.trim()).join("")
                        : "author unknown"
                    }
                    ${book["volumeInfo"]["publishedDate"] != undefined ? " | " + formatDate(book["volumeInfo"]["publishedDate"]) : ""}
                </p>
                <p>
                    ${book["searchInfo"] != undefined ? book["searchInfo"]["textSnippet"] : ""}
                </p>
                <a href=${book["volumeInfo"]["infoLink"] != undefined?book["volumeInfo"]["infoLink"]: ""} class="btn btn-primary text-white" target="_blank" >See more</a>
            </div>
        </div>
    `);
    return cardContainer;
}

function formatDate(date: string | null) {
    if (date == null) {
        return "";
    }
    let regex = new RegExp("^\\d{4}\-\\d{2}\-\\d{2}$")
    if (regex.test(date)) {
        return date.substr(0, 4);
    } return date;
}