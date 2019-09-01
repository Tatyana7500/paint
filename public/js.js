function Data() {
    this.x = 0;
    this.y = 0;
    this.width = null;
    this.style = null;
}

let dataDat = new Data();

const SVGStart = function () {

    this.onMouseUp = function (e) {
        this.draw = false;
        this.coords = null;
        this.path = null;
    }.bind(this);

    this.onMouseDown = function (e) {
        dataDat.x = e.offsetX;
        dataDat.y = e.offsetY;
        dataDat.width = this.width.value;
        dataDat.style =this.style.value;
        this.draw = true;
        let str = `m${dataDat.x} ${dataDat.y} ${dataDat.width} ${dataDat.style}`;
        this.sendPoint(str);
    }.bind(this);

    this.onMouseMove = function (e){
        if (this.draw === true) {
            dataDat.x = e.offsetX;
            dataDat.y = e.offsetY;
            dataDat.width = this.width.value;
            dataDat.style =this.style.value;
            let str = `L${dataDat.x} ${dataDat.y} ${dataDat.width} ${dataDat.style}`;
            this.sendPoint(str);
        }
    }.bind(this);

    this.onChangeColor = function (e) {
        dataDat.style = e.value;
        this.styleValue = e.value;
    };

    this.onChangeWidth = function (e) {
        dataDat.width = e.value;
        this.widthValue = e.value;
    };

    this.onMouseLeave = (e) => {
        this.draw = false;
        this.path = null;
        this.pointVec = [];
    };

    this.addPoint = function (point) {
        this.pointVec = this.pointVec.concat(point);
    };

    this.startPoint = function(point) {

        point = point.substring(1);
        let array  = point.split(" ");

        this.coords = `m${array[0]} ${array[1]} `;
        this.path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        this.path.setAttributeNS(null, 'stroke', array[3]);
        this.path.setAttributeNS(null, 'stroke-width', array[2]);
        this.path.setAttributeNS(null, 'fill', 'none');
        this.path.setAttributeNS(null, 'd', this.coords);
        this.svg.appendChild(this.path);
    }.bind(this);

    this.drawing = function (point) {
        if (this.draw || this.sendData) {

            point = point.substring(1);
            let array  = point.split(" ");
            this.coords += `L ${array[0]} ${array[1]} `;
            this.path.setAttributeNS(null, 'd', this.coords);
            this.sendData = false;
        }
    }.bind(this);

    this.init = () => {

        this.svg = null;
        this.style = null;
        this.width = null;
        this.path = null;

        this.svg = document.querySelector('svg');
        this.svg.onmousedown = this.onMouseDown;

        this.svg.onmousemove = this.onMouseMove;
        this.svg.onmouseup = this.onMouseUp;
        this.svg.onmouseleave = this.onMouseLeave;

        this.draw = false;
        this.sendData = false;
        this.pointVec = null;
        this.coords = null;

        this.style = document.getElementById('color');
        this.width = document.getElementById('width');
        this.style.onchange = this.onChangeColor;
        this.width.onchange = this.onChangeWidth;

        this.socket = io.connect('/');
        this.socket.on('connect', this.socketConnected);
        this.socket.on('disconnect', this.socketDisconnected);
        this.socket.on('data', this.socketReceivedData);

    };

    this.socketConnected = function () {
        console.log('Client has connected to the server!');
    }.bind(this);

    this.socketDisconnected = function () {
        console.log('Client has disconnected!');
    }.bind(this);

    this.socketReceivedData = function (data) {
        console.log('Received a message from the server!', data);

        this.sendData = true;
        this.drawPoint(data);

    }.bind(this);

    this.drawPoint = function (point) {

        if (point.indexOf('m')){
            this.drawing(point);
        } else {
            this.startPoint(point);

        }
    }.bind(this);

    this.sendPoint = function (point) {
        this.socket.emit('data', point);
    }.bind(this);

};

let svg = new SVGStart();
svg.init();