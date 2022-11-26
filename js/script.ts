const API_VERSION = "1";
const BASE_API_URL = "https://www.googleapis.com";
var inputSearch: HTMLInputElement = document.getElementById("txt-search") as HTMLInputElement;
const ENTER_KEY: string = "Enter";

// pagination
let total: number = 0;
let limit: number = 20;
let offset = 0;
let currentQuery = "";

let scrollBlock: boolean= false;

// events
window.addEventListener("scroll" ,()=>{
    if ((window.innerHeight + window.pageYOffset)>= document.body.offsetHeight-50) {
        if(!scrollBlock){
            offset += limit; 
            scrollBlock=true;
            search(currentQuery, offset);
        }
    }
});


inputSearch.addEventListener("keypress", (evt: KeyboardEvent) => {
    if (evt.code == ENTER_KEY) {
        inputSearch.classList.remove("is-invalid");
        let feedBack = document.getElementById("search-feedback");
        feedBack?.classList.remove("d-block")
        if (inputSearch.value == "") {
            console.warn("Empty query");
            inputSearch.classList.add("is-invalid");
            feedBack?.classList.add("d-block");
            return;
        }
        search(inputSearch.value);
    }
});


function onSearch(){
    search(inputSearch.value)
}

function search(query: string, offset:number=0) {
    // end result
    if( offset != 0 && (offset + limit)>total){
        return;
    }
    let url = `${BASE_API_URL}/books/v${API_VERSION}/volumes?q=${query}&startIndex=${offset}&maxResults=${limit}`;
    console.info(url);

    let xhttp: XMLHttpRequest = new XMLHttpRequest();
    xhttp.open("get", url) 
    xhttp.onloadstart = ()=> {
        if(offset == 0){
            $("#loading").css("display","block");
            $("#card-list").html("");
        }else{
            $("#loading").css("display","none");          
            // loading bottom
            let loading_bottom = document.createElement("div") as HTMLDivElement;
            loading_bottom.id = "loading-bottom";
            loading_bottom.style.padding = "8px"
            loading_bottom.classList.add("text-center")
            let img = document.createElement("img") as HTMLImageElement;
            img.src = "img/loading.gif";
            loading_bottom.append(img)
            $("#card-list").append(loading_bottom);
        }

    }
    xhttp.onreadystatechange = (evt: Event) => {
        if (xhttp.readyState == 4) {        
            console.log("Read state 4: DONE")
            if (xhttp.status == 200) {            
                let reponseJSON = JSON.parse(xhttp.responseText);
                let books = reponseJSON["totalItems"] != 0 ? reponseJSON["items"] : [];
                total = reponseJSON["totalItems"];     
                let container: HTMLDivElement = document.getElementById("row-result") as HTMLDivElement;
                let oldCardList: HTMLDivElement = document.getElementById("card-list") as HTMLDivElement;
                $("#loading").css("display","none");
                $("#loading-bottom").remove();
                if(books.length == 0){
                    let emptyList: HTMLDivElement = document.createElement("div");
                    emptyList.id = "card-list";
                    emptyList.className = "col mb-4 text-muted";
                    emptyList.innerHTML = "No results found";
                    container.replaceChild( emptyList, oldCardList);
                }else{
                    if(offset == 0) {                
                        container.replaceChild(buildListCard(books),oldCardList);             
                    }else{                     
                        let list = document.getElementById("card-list");
                        for( let i:number=0; i<books.length;i++){
                            let card = buildCard(books[i]);
                            list?.appendChild(card);
                        }   
                    }                                     
                }              
                currentQuery = query;
                scrollBlock=false            
            }         
        }
    }
    xhttp.onerror = function (evt) {
        console.error("Status code: " + xhttp.status);
        if(xhttp.status ==404){
            $("#modal-erro-body").text("Not found resource")
        }
        $("#error-modal").modal("show");
        $("#loading").css("display","none");
    }
    xhttp.timeout = 3000;
    xhttp.send(); 
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
    // console.log(book);
    let cardContainer: HTMLDivElement = document.createElement("div");
    cardContainer.className = "card shadow-sm mb-2";
    cardContainer.insertAdjacentHTML("afterbegin", `
        <div class="card-header d-block d-sm-none">
            <h5 class="text-gray">${book["volumeInfo"]["title"]}</h5>
        </div>
        <div class="card-body d-flex">
            <div style="min-width: 128px;">
                <img  class="fluid-img" alt="image not available" src=${book["volumeInfo"]["imageLinks"] != undefined ? book["volumeInfo"]["imageLinks"]["smallThumbnail"] : "img/thumbnail.png"}>
            </div>
            <div class="px-3 flex-grow-1">
                <h4 class="text-gray d-none d-sm-block">${book["volumeInfo"]["title"]}</h4>
                <div class="d-flex flex-column" >
                    <p class="order-sm-2">
                        ${book["searchInfo"] != undefined ? book["searchInfo"]["textSnippet"] : ""}
                    </p>
                    <p class="order-sm-1 text-gray text-muted">
                        ${book["volumeInfo"]["authors"] != undefined ?
                        book["volumeInfo"]["authors"].map((item: string, i: number) => item.trim()).join(""): "author unknown"}
                        ${book["volumeInfo"]["publishedDate"] != undefined ? " | " + formatDate(book["volumeInfo"]["publishedDate"]) : ""}
                    </p>
                </div>
                <a href=${book["volumeInfo"]["infoLink"] != undefined ? book["volumeInfo"]["infoLink"] : ""} class="btn btn-primary btn-sm text-white" target="_blank" >See more</a>
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
