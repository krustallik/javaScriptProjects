// Базовий клас Shape
class Shape {
    constructor(x, y, color = "gray") {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    calculateArea() {}
    calculatePerimeter() {}
    render(container) {}

    makeDraggable(element) {
        let offsetX, offsetY;
        element.addEventListener("mousedown", (e) => {
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            document.addEventListener("mousemove", moveElement);
            document.addEventListener("mouseup", stopDragging);
        });

        const moveElement = (e) => {
            element.style.left = `${e.clientX - offsetX}px`;
            element.style.top = `${e.clientY - offsetY}px`;
        };

        const stopDragging = () => {
            document.removeEventListener("mousemove", moveElement);
            document.removeEventListener("mouseup", stopDragging);
        };
    }
}

// Клас Квадрат
class Square extends Shape {
    constructor(x, y, size, color) {
        super(x, y, color);
        this.size = size;
    }

    calculateArea() {
        return this.size ** 2;
    }

    calculatePerimeter() {
        return 4 * this.size;
    }

    render(container) {
        const square = document.createElement("div");
        square.className = "shape square";
        square.style.width = `${this.size}px`;
        square.style.height = `${this.size}px`;
        square.style.left = `${this.x}px`;
        square.style.top = `${this.y}px`;
        square.style.backgroundColor = this.color;
        square.innerText = `Площа: ${this.calculateArea()} \n Периметр: ${this.calculatePerimeter()}`;
        container.appendChild(square);
        this.makeDraggable(square);
    }
}

// Клас Прямокутник, наслідує Квадрат
class Rectangle extends Square {
    constructor(x, y, width, height, color) {
        super(x, y, width, color);
        this.height = height;
    }

    calculateArea() {
        return this.size * this.height;
    }

    calculatePerimeter() {
        return 2 * (this.size + this.height);
    }

    render(container) {
        const rectangle = document.createElement("div");
        rectangle.className = "shape rectangle";
        rectangle.style.width = `${this.size}px`;
        rectangle.style.height = `${this.height}px`;
        rectangle.style.left = `${this.x}px`;
        rectangle.style.top = `${this.y}px`;
        rectangle.style.backgroundColor = this.color;
        rectangle.innerText = `Площа: ${this.calculateArea()} \n Периметр: ${this.calculatePerimeter()}`;
        container.appendChild(rectangle);
        this.makeDraggable(rectangle);
    }
}

// Клас Круг
class Circle extends Shape {
    constructor(x, y, radius, color) {
        super(x, y, color);
        this.radius = radius;
    }

    calculateArea() {
        return Math.PI * this.radius ** 2;
    }

    calculatePerimeter() {
        return 2 * Math.PI * this.radius;
    }

    render(container) {
        const circle = document.createElement("div");
        circle.className = "shape circle";
        const diameter = this.radius * 2;
        circle.style.width = `${diameter}px`;
        circle.style.height = `${diameter}px`;
        circle.style.left = `${this.x}px`;
        circle.style.top = `${this.y}px`;
        circle.style.backgroundColor = this.color;
        circle.innerText = `Площа: ${this.calculateArea().toFixed(2)} \n Периметр: ${this.calculatePerimeter().toFixed(2)}`;
        container.appendChild(circle);
        this.makeDraggable(circle);
    }
}

// Масив фігур
const shapes = [
    new Square(50, 100, 100, "green"),
    new Rectangle(200, 150, 120, 80, "blue"),
    new Circle(400, 200, 60, "red"),
    new Circle(600, 200, 90, "purple"),
];

// Виведення фігур
const container = document.getElementById("shapes-container");
shapes.forEach((shape) => shape.render(container));
