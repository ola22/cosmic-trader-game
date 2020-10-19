var dataStructure;
var jsonString;
var planets;
var ships;
var scoreboard;
var pseudo;
var pseudonim;
var interval;
var money;
var currentMoney;
/* funkcja wywoływana przy załadowaniu strony, pobiera informacje od serwera */
window.onload = function () {
    fetch("/updateLogins/alpaczka/baboonek/false")
        .then(function (response) { return response.json(); })
        .then(function (myJson) {
        var dataStructure2 = myJson;
        var jsonString = JSON.stringify(dataStructure2);
        var e = JSON.parse(jsonString);
    });
    pseudo = (new URL(document.location.href)).searchParams;
    var namee = pseudo.get('selektor');
    var nameToSend = namee.substring(1, namee.length - 1);
    fetch("/getJson/" + nameToSend)
        .then(function (response) { return response.json(); })
        .then(function (myJson) {
        var dataStructure2 = myJson;
        jsonString = JSON.stringify(dataStructure2);
        dataStructure = JSON.parse(JSON.parse(jsonString));
    })
        .then(function () {
        planets = dataStructure.planets;
        ships = dataStructure.starships;
        /* Get scoreboard from localStorage */
        scoreboard = JSON.parse(localStorage.getItem("Space Traders Scoreboard"));
        /* Wyświetlanie i przekazywanie pseudonimu gracza */
        pseudonim = pseudo.get('pseudonim');
        var loginDiv = document.getElementById('pseudonim');
        loginDiv.textContent = pseudonim;
        /* Wyświetlanie początkowego stanu konta gracza */
        money = dataStructure.initial_credits;
        currentMoney = document.getElementById('money');
        currentMoney.textContent = "Stan konta: " + money;
        /* Inicjalizacja zbiorów produktów statków */
        for (var ship in ships) {
            ships[ship].cargo = {};
        }
        setShips();
        /* Dodanie do składu planet produktów o zerowych ilościach */
        for (var planet in planets) {
            for (var _i = 0, _a = dataStructure.items; _i < _a.length; _i++) {
                var item = _a[_i];
                if (!(item in planets[planet].available_items)) {
                    planets[planet].available_items[item] = {
                        available: 0,
                        buy_price: 0,
                        sell_price: 0
                    };
                }
            }
        }
        /* Wyświetlanie i aktualizowanie pozostałego czasu gry */
        var time = dataStructure.game_duration;
        var currentTime = document.getElementById('currentTime');
        currentTime.textContent = "Czas gry: " + time;
        interval = setInterval(function () {
            if (time > 0)
                time -= 1;
            else
                endGame();
            currentTime.textContent = "Czas gry: " + time;
        }, 1000);
        showPlanets();
        showShips();
    });
};
/* Przypisanie statków z pliku json do planet */
function setShips() {
    for (var planet in planets)
        planets[planet].planetShips = [];
    for (var ship in ships) {
        var planet = ships[ship].position;
        planets[planet].planetShips.push(ship);
    }
}
/* Funkcja wyświetla listę planet ekranu głównego */
function showPlanets() {
    var planetWindow = document.getElementById("planets_grid_id");
    for (var planet in planets) {
        var element = document.createElement("a");
        element.setAttribute("href", "#popup1");
        var title = document.createElement("h1");
        title.setAttribute("id", "planet_list");
        title.setAttribute("class", "items clickable");
        title.textContent = planet + "  " + planets[planet].x + "x" + planets[planet].y;
        title.setAttribute("onclick", "openPlanetsPopup(\"" + planet + "\")");
        element.appendChild(title);
        planetWindow.appendChild(element);
    }
}
/* Funkcja wyświetla listę statków kosmicznych ekranu głównego */
function showShips() {
    var shipsWindow = document.getElementById("ships_grid_id");
    while (shipsWindow.lastChild !== null)
        shipsWindow.removeChild(shipsWindow.lastChild);
    var ships_h = document.createElement("h1");
    ships_h.setAttribute("class", "headers");
    ships_h.textContent = "Statki kosmiczne";
    shipsWindow.appendChild(ships_h);
    for (var ship in ships) {
        var element = document.createElement("a");
        var title = document.createElement("h1");
        title.setAttribute("id", "ships_list");
        title.setAttribute("class", "items clickable");
        if (ships[ship].moving) {
            element.setAttribute("href", "#popup2");
            title.textContent = ship + " w drodze";
            title.setAttribute("onclick", "openShipInJourneyPopup(\"" + ship + "\")");
        }
        else {
            element.setAttribute("href", "#popup3");
            title.textContent = ship + " " + ships[ship].position;
            title.setAttribute("onclick", "openShipOnPlanetPopup(\"" + ship + "\")");
        }
        element.appendChild(title);
        shipsWindow.appendChild(element);
    }
}
/* Funkcja otwiera popup planety */
function openPlanetsPopup(planet) {
    // ustalanie i wyświetlanie nazwy planety
    var planetName = document.getElementById("planets_name_id");
    planetName.textContent = planet;
    // wypisywanie listy statków danej planety
    showPlanetsStarships(planet);
    // wyświetlanie listy towarów dostepnych na planecie
    showPlanetsItems(planet);
}
/* Funkcja popupu planety, generuje i wyświetla listę statków danej planety */
function showPlanetsStarships(planet) {
    var shipsWindow = document.getElementById("plantes_ships_grid_id");
    while (shipsWindow.lastChild !== null)
        shipsWindow.removeChild(shipsWindow.lastChild);
    var ships_h = document.createElement("h1");
    ships_h.setAttribute("class", "headers");
    ships_h.textContent = "Statki kosmiczne";
    shipsWindow.appendChild(ships_h);
    for (var _i = 0, _a = planets[planet].planetShips; _i < _a.length; _i++) {
        var ship = _a[_i];
        var element = document.createElement("a");
        var title = document.createElement("h1");
        title.setAttribute("id", "p_ship_id");
        title.setAttribute("class", "items clickable");
        title.textContent = ship;
        if (!ships[ship].moving) {
            element.setAttribute("href", "#popup3");
            title.setAttribute("onclick", "openShipOnPlanetPopup(\"" + ship + "\")");
        }
        else
            continue;
        element.appendChild(title);
        shipsWindow.appendChild(element);
    }
}
/* Funkcja popupu planety, generuje i wyświetla listę towarów dostepnych na danej planecie  */
function showPlanetsItems(planet) {
    var itemWindow = document.getElementById("items_grid_id");
    while (itemWindow.lastChild !== null)
        itemWindow.removeChild(itemWindow.lastChild);
    var header = document.createElement("h1");
    header.setAttribute("class", "headers");
    header.textContent = "Dostępne towary";
    itemWindow.appendChild(header);
    for (var item in planets[planet].available_items) {
        var title = document.createElement("h1");
        title.setAttribute("class", "items_style");
        title.setAttribute("id", "p_item_id");
        title.textContent = item + " " + planets[planet].available_items[item].available
            + "szt. " + planets[planet].available_items[item].buy_price + "(kr)";
        itemWindow.appendChild(title);
    }
}
/* Funkcja otwiera popup statku na planecie */
function openShipOnPlanetPopup(ship) {
    // ustalanie i wyświetlanie nazwy statku
    var shipName = document.getElementById("ships_title2_id");
    shipName.textContent = ship;
    // wyświetlanie maksymalnego załadunku i położenia
    var capacity = document.getElementById("capacity2");
    capacity.textContent = "Maksymalna ładowność: " + ships[ship].cargo_hold_size;
    var location = document.getElementById("location2");
    location.textContent = "Położenie: " + ships[ship].position;
    // wyświetlanie stanu załadunku statku
    showShipsCargo("cargo2", ship);
    // wyświetlanie pola dokonywania zakupów
    showItemsToSell(ship);
    showItemsToBuy(ship);
    // wyświetlanie okienka wyboru celu podróży
    makeDestinationList(ships[ship].position);
    var button = document.getElementById("travel_button");
    button.setAttribute("class", "clickable");
    button.setAttribute("onclick", "showTravelDestination(\"" + ship + "\")");
    window.location.href = "#popup3";
}
/* Funkcja otwiera popup statku w podróży */
function openShipInJourneyPopup(ship) {
    // ustalanie i wyświetlanie nazwy statku
    var shipName = document.getElementById("ships_title_id");
    shipName.textContent = ship;
    // wyświetlanie maksymalnego załadunku i położenia
    var capacity = document.getElementById("capacity");
    capacity.textContent = "Maksymalna ładowność: " + ships[ship].cargo_hold_size;
    var location = document.getElementById("location");
    location.textContent = "Położenie: w drodze";
    // wyświetlanie stanu załadunku statku
    showShipsCargo("cargo", ship);
    window.location.href = "#popup2";
}
/* Funkcja popupu statku na planecie, tworzy listę celów podróży dla statku,
    znajdującego się na danej planecie */
function makeDestinationList(planet) {
    var select = document.getElementById('planet_selector');
    while (select.lastChild !== null)
        select.removeChild(select.lastChild);
    for (var p in planets) {
        if (p !== planet) {
            var element = document.createElement("option");
            element.setAttribute("value", "\"" + p + "\"");
            element.textContent = p;
            select.appendChild(element);
        }
    }
}
/* Funkcja popupu statku na planecie, generuje i wyświetla obszar dokonywania zakupów */
function showItemsToBuy(ship) {
    var item_selector = document.getElementById("item_selector");
    while (item_selector !== null && item_selector.lastChild !== null)
        item_selector.removeChild(item_selector.lastChild);
    for (var item in planets[ships[ship].position].available_items) {
        if (planets[ships[ship].position].available_items[item].available === 0)
            continue;
        var el = document.createElement("option");
        el.textContent = item;
        item_selector.appendChild(el);
    }
    var button = document.getElementById("buy_button");
    button.setAttribute("class", "clickable");
    button.setAttribute("onclick", "buyItems(\"" + ship + "\")");
}
/* Funkcja pupupu statku na planecie, generuje i wyświetla obszar dokonywania sprzedaży */
function showItemsToSell(ship) {
    var item_selector = document.getElementById("item_sell_selector");
    while (item_selector !== null && item_selector.lastChild !== null)
        item_selector.removeChild(item_selector.lastChild);
    for (var item in ships[ship].cargo) {
        var el = document.createElement("option");
        el.textContent = item;
        item_selector.appendChild(el);
    }
    var button = document.getElementById("sell_button");
    button.setAttribute("class", "clickable");
    button.setAttribute("onclick", "sellItems(\"" + ship + "\",)");
}
/* Funkcja popupu statków, wyświetla na stronie aktualny ładunek znajdujący się na statku */
function showShipsCargo(htmlLocation, ship) {
    var ships_cargo = document.getElementById(htmlLocation);
    while (ships_cargo !== null && ships_cargo.lastChild !== null)
        ships_cargo.removeChild(ships_cargo.lastChild);
    var header = document.createElement("h1");
    header.setAttribute("class", "headers");
    header.textContent = "Mój załadunek";
    ships_cargo.appendChild(header);
    for (var item in ships[ship].cargo) {
        var el = document.createElement("h1");
        el.setAttribute("class", "items_style");
        if (!ships[ship].moving) {
            el.textContent = item + " " + ships[ship].cargo[item].available + "szt. " +
                planets[ships[ship].position].available_items[item].sell_price + "(kr)";
        }
        else {
            el.textContent = item + " " + ships[ship].cargo[item].available + "szt. ";
        }
        ships_cargo.appendChild(el);
    }
}
/* Funkcja sprzedawania produktów na planecie */
function sellItems(ship) {
    var selector = document.getElementById("item_sell_selector");
    if (selector.lastChild === null) {
        alert("Brak produktu do sprzedaży");
        return;
    }
    var choice = document.getElementById("item_sell_selector");
    var index = choice.selectedIndex;
    var product = document.getElementById("item_sell_selector")[index].textContent;
    var quantity = document.getElementById('input2').value;
    if (quantity === "") {
        alert("Błędna ilość towaru.");
        return;
    }
    var ships_qu = ships[ship].cargo[product].available;
    var sell_price = planets[ships[ship].position].available_items[product].sell_price;
    var quantity_numb = Number(quantity);
    if (quantity_numb <= 0) {
        alert("Błędna ilość towaru");
        return;
    }
    if (quantity_numb > ships_qu) {
        alert("Nie posiadasz takiej ilośći towaru");
        return;
    }
    refreshCargoAfterSell(ship, product, quantity_numb, ships_qu);
    // wyliczanie nowego stanu konta gracza
    refreshMoney(quantity_numb * sell_price, true);
    // aktualizowanie popupu
    showItemsToBuy(ship);
    showItemsToSell(ship);
    showShipsCargo("cargo2", ship);
}
/* Funkcja kupowania produktów na planecie */
function buyItems(ship) {
    var choice = document.getElementById("item_selector");
    var index = choice.selectedIndex;
    var product = document.getElementById("item_selector")[index].textContent;
    var quantity = document.getElementById('input1').value;
    if (quantity === "") {
        alert("Błędna ilość towaru.");
        return;
    }
    var planets_qu = planets[ships[ship].position].available_items[product].available;
    var buy_price = planets[ships[ship].position].available_items[product].buy_price;
    var quantity_numb = Number(quantity);
    var place_left = countPlaceLeft(ship);
    if (quantity_numb > planets_qu || quantity_numb <= 0) {
        alert("Na planecie nie ma żądanej ilości produktu");
        return;
    }
    if (money < quantity_numb * buy_price) {
        alert("Posiadasz za mało pieniędzy");
        return;
    }
    if (place_left < quantity_numb) {
        alert("Nie posiadasz miejsca na taką ilość towaru");
        return;
    }
    refreshCargoAfterBuy(ship, product, quantity_numb);
    // wyliczanie nowego stanu konta gracza
    refreshMoney(quantity_numb * buy_price, false);
    // aktualizowanie popupu
    showItemsToBuy(ship);
    showItemsToSell(ship);
    showShipsCargo("cargo2", ship);
}
/* Funkcja wyliczająca aktualny stan załadowania statku */
function countPlaceLeft(ship) {
    var cargo_hold_s = ships[ship].cargo_hold_size;
    var counter = 0;
    for (var item in ships[ship].cargo) {
        counter += ships[ship].cargo[item].available;
    }
    return cargo_hold_s - counter;
}
/* Funkcja aktualizująca stan konta gracza */
function refreshMoney(income, add) {
    currentMoney = document.getElementById('money');
    if (add)
        money = money + income;
    else
        money = money - income;
    currentMoney.textContent = "Stan konta: " + money;
}
/* Funkcja aktualizująca stany magazynów po zakupach */
function refreshCargoAfterBuy(ship, product, quantity_numb) {
    // aktualizowanie stanu magazynu planety
    var new_q = planets[ships[ship].position].available_items[product].available;
    new_q -= quantity_numb;
    planets[ships[ship].position].available_items[product].available = new_q;
    // aktualizowanie stanu ładowni statku
    if (!(product in ships[ship].cargo)) {
        ships[ship].cargo[product] = {
            available: quantity_numb,
            buy_price: 0,
            sell_price: 0
        };
    }
    else
        ships[ship].cargo[product].available += quantity_numb;
}
/* Funkcja aktualizująca stany magazynów po sprzedaży */
function refreshCargoAfterSell(ship, product, quantity_numb, ships_qu) {
    // aktualizowanie stanu magazynu planety
    var new_q = planets[ships[ship].position].available_items[product].available;
    new_q += quantity_numb;
    planets[ships[ship].position].available_items[product].available = new_q;
    // aktualizowanie stanu ładowni statku
    if (quantity_numb === ships_qu)
        delete ships[ship].cargo[product];
    else
        ships[ship].cargo[product].available = ships_qu - quantity_numb;
}
/* Funkcja wyboru kolejnego celu podróży */
function showTravelDestination(ship) {
    var choice = document.getElementById("planet_selector");
    var index = choice.selectedIndex;
    var destination = document.getElementById("planet_selector")[index].textContent;
    var time_journey = getJourneyTime(ships[ship].position, destination);
    ships[ship].moving = true;
    ships[ship].position = destination;
    setShips();
    showShips();
    openShipInJourneyPopup(ship);
    // startowanie licznika
    startTimer(time_journey);
    // funkcja wywołana po czasie dolotu statku na nową planetę
    setTimeout(function () {
        ships[ship].moving = false;
        setShips();
        showShips();
        openShipOnPlanetPopup(ship);
    }, time_journey * 1000);
}
/* Funkcja odpalająca licznik czasu, jaki pozostał statkowi na dotarcie na nową planetę */
function startTimer(time_journey) {
    var rest_time = time_journey;
    var time_counter = document.getElementById("timer");
    setInterval(function () {
        if (rest_time > 0)
            rest_time -= 1;
        else
            return;
        time_counter.textContent = "Pozostały czas lotu: " + rest_time;
    }, 1000);
}
/* Funkcja zwraca czas potrzebny na dotarcie z planety a, na planetę b */
function getJourneyTime(a, b) {
    var x_a = planets[a].x;
    var y_a = planets[a].y;
    var x_b = planets[b].x;
    var y_b = planets[b].y;
    return Math.round(Math.sqrt(Math.pow(x_a - x_b, 2) +
        Math.pow(y_a - y_b, 2)));
}
/* Funkcja kończąca grę */
function endGame() {
    var i = 0;
    clearInterval(interval);
    for (i; i < scoreboard.length; i++) {
        if (scoreboard[i][1] < money)
            break;
    }
    scoreboard.splice(i, 0, [pseudonim, money]);
    scoreboard.splice(10, 1);
    window.localStorage.setItem("Space Traders Scoreboard", JSON.stringify(scoreboard));
    window.location.href = "../index.html";
}
