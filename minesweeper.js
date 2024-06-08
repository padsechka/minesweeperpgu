// Конструктор игры Сапер
function MineSweeper(width, height, bombs){
    this._width = width; // Ширина игрового поля
    this._height = height; // Высота игрового поля
    this._bombs = bombs; // Количество мин
    this.allNodes = []; // Массив всех ячеек
    this._squareCount = width * height - bombs; // Количество безопасных ячеек
    this._gameover = false; // Статус игры (окончена или нет)
}

// Прототип для MineSweeper
MineSweeper.prototype = {

    // Геттеры и сеттеры для ширины, высоты и количества мин
    get width() { return this._width; },
    set width(width) { this._width = width; },
    get height() { return this._height; },
    set height(height) { this._height = height; },
    get bombs() { return this._bombs; },
    set bombs(bombs) { this._bombs = bombs; },

    // Метод для создания игрового поля
    construct : function(div){
        var table = document.createElement("table");
        table.className = "ms-tb";
        for(var i = 0; i < this.height; i++){
            var tr = document.createElement("tr");
            tr.className = "ms-tr";
            this.allNodes.push([]);
            for(var j = 0; j < this.width; j++){
                var td = document.createElement("td");
                td.className = "ms-td idle mark-SAFE";
                td.cell = new Node(j, i, td, this);
                tr.appendChild(td);
                this.allNodes[i].push(td.cell);
            }
            table.appendChild(tr);
        }
        // Устанавливаем ячейки вокруг каждой ячейки
        for(var y in this.allNodes)
            for(var x in this.allNodes[y])
                this.allNodes[y][x].around = Node._around(this.allNodes[y][x]);
        // Расставляем мины случайным образом
        while(this._bombs > 0){
            var x = Math.round(Math.random() * (this.width - 1));
            var y = Math.round(Math.random() * (this.height - 1));
            if(this.allNodes[y][x].hasBombIn()) continue;
            this.allNodes[y][x].putBombIn();
            this._bombs--;
        }
        div.appendChild(table);
    },
    
    // Метод проверки завершения игры
    isGameOver: function(){ return this._gameover; },
    
    // Метод завершения игры при проигрыше
    loseGame: function(){ 
        this._gameover = true; 
        for(var i in this.allNodes) 
            for(var j in this.allNodes)
                if(this.allNodes[i][j].hasBombIn()) Node._formatTd(this.allNodes[i][j]);
        alert("I'm sorry, you lost the game..."); 
    },
    
    // Метод завершения игры при выигрыше
    winGame: function(){
        this._gameover = true;
        alert("Congratulations! You have won the game!!!"); 
    }
}

// Конструктор для ячеек
function Node(x, y, td, minesweeper){
    this._x = x; // Координата x ячейки
    this._y = y; // Координата y ячейки
    this._td = td; // HTML-элемент ячейки
    this._minesweeper = minesweeper; // Ссылка на игру
    this._bomb = false; // Присутствие мины
    this._number = 0; // Количество мин вокруг
    this._mark = Node.SAFE; // Маркер ячейки
    var _this = this;
    // События для ячейки
    td.onclick = function(){ Node.reveal(_this); };
    td.oncontextmenu = function(){ Node._mark(_this); return false; };
    td.ondblclick = function(){ Node.dblclick(_this); };
    this.revealed = false; // Статус раскрытия ячейки
}

// Константы для маркеров ячеек
Node.SAFE = 0;
Node.DANGER = 1;
Node.DOUBT = 2;

// Метод двойного клика по ячейке
Node.dblclick = function(node){
    if(!node.revealed) return;
    if(node.bombsAround() == 0) return;
    var dangers = 0;
    var reveals = [];
    for(var i in node.around){ 
        if(node.around[i]._mark == Node.DANGER) dangers++;
        else if(!node.around[i].revealed) reveals.push(node.around[i]);
    }
    if(!(node.bombsAround() == dangers)) return;
    for(var j in reveals) Node.reveal(reveals[j]); 
}

// Метод для установки маркера на ячейку
Node._mark = function(node){
    if(node.minesweeper.isGameOver()) return;
    if(node.revealed) return;
    node._mark += 1;
    node._mark %= 3;
    Node._markTd(node); 
    return;
}

// Метод для обновления класса ячейки в зависимости от маркера
Node._markTd = function(node){
    var mark = node.td.className;
    var state = "";
    if(node._mark == Node.SAFE) state = "SAFE";
    else if(node._mark == Node.DOUBT) state = "DOUBT";
    else if(node._mark == Node.DANGER) state = "DANGER";

    mark = mark.replace(/mark-(\w+)/, "mark-"+state);
    node.td.className = mark;
}

// Метод раскрытия ячейки
Node.reveal = function(node){
    if(!node) return;
    if(node._mark == Node.DANGER) return;
    if(node.minesweeper.isGameOver()) return;
    if(node.revealed) return;
    node.revealed = true;
    Node._formatTd(node);
    if(node.hasBombIn()) node.minesweeper.loseGame();
    if(node.bombsAround()) return;
    setTimeout(function(){
        for(var i in node.around){
            Node.reveal(node.around[i]);
        }
    }, 100);
}

// Метод форматирования ячейки
Node._formatTd = function(node){
    if(node.hasBombIn()){
        node.td.innerHTML = "X";
        node.td.className = "ms-td bomb";
    }
    else{
        var b = node.bombsAround();
        node.td.innerHTML = (b) ? b : "";
        node.td.className = "ms-td revealed-ok number"+b;
        if(--node.minesweeper._squareCount == 0) node.minesweeper.winGame();
    }
}

// Метод получения ячеек вокруг данной ячейки
Node._around = function(node){
    var around = [];
    if(node.x > 0){
        around.push(node.minesweeper.allNodes[node.y][node.x-1]);
        if(node.y > 0) around.push(node.minesweeper.allNodes[node.y-1][node.x-1]);
        if(node.y < node.minesweeper.height-1) around.push(node.minesweeper.allNodes[node.y+1][node.x-1]);
    }
    if(node.x < node.minesweeper.width-1){
        around.push(node.minesweeper.allNodes[node.y][node.x+1]);
        if(node.y > 0) around.push(node.minesweeper.allNodes[node.y-1][node.x+1]);
        if(node.y < node.minesweeper.height-1) around.push(node.minesweeper.allNodes[node.y+1][node.x+1]);
    }
    if(node.y > 0) around.push(node.minesweeper.allNodes[node.y-1][node.x]);
    if(node.y < node.minesweeper.height-1) around.push(node.minesweeper.allNodes[node.y+1][node.x]);
    return around;
}

// Прототип для Node
Node.prototype = {

    // Геттеры и сеттеры для координат, HTML-элемента и игры
    get x() { return this._x; },
    set x(x) { this._x = x; },
    get y() { return this._y; },
    set y(y) { this._y = y; },
    get td() { return this._td; },
    set td(td) { this._td = td; },
    get minesweeper() { return this._minesweeper; },
    set minesweeper(minesweeper) { this._minesweeper = minesweeper; },

    // Метод для установки мины в ячейку
    putBombIn : function(){ 
        this._bomb = true;
        for(var i in this.around) this.around[i].putBombAround();
    },
    
    // Метод проверки наличия мины в ячейке
    hasBombIn : function(){ return this._bomb; },
    
    // Метод получения количества мин вокруг ячейки
    bombsAround : function(){ return this._number; },
    
    // Метод увеличения счетчика мин вокруг ячейки
    putBombAround : function(){ this._number++; }
}
