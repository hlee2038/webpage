
/* ========================================
   1. 피자 메뉴 정보 및 이미지 등록

   피자 이미지 변경 시 image 경로만 수정하세요.
   price는 Medium 사이즈의 기본 가격입니다.
   Large 사이즈 가격은 자동으로 계산됩니다.
======================================== */

const pizzas = [
    {
        id: "margherita",
        name: "마르게리타",
        english: "Margherita",
        price: 19900,
        image: "images/margherita.jpg",
        description:
            "신선한 토마토 소스와 모차렐라 치즈, 바질의 향이 어우러진 정통 이탈리안 클래식 피자."
    },
    {
        id: "pepperoni",
        name: "페퍼로니",
        english: "Pepperoni",
        price: 21900,
        image: "images/pepperoni.jpg",
        description:
            "풍미 가득한 페퍼로니와 풍성한 모차렐라 치즈가 어우러진 클래식 아메리칸 피자."
    },
    {
        id: "quattro-cheese",
        name: "콰트로 치즈",
        english: "Quattro Cheese",
        price: 22900,
        image: "images/quattro-cheese.jpg",
        description:
            "네 가지 치즈의 깊고 고소한 풍미를 담아낸 부드럽고 진한 프리미엄 치즈 피자."
    },
    {
        id: "bulgogi",
        name: "불고기",
        english: "Bulgogi",
        price: 23900,
        image: "images/bulgogi.jpg",
        description:
            "달콤하고 짭조름한 불고기에 신선한 채소와 모차렐라 치즈를 더한 한국식 피자."
    },
    {
        id: "hawaiian",
        name: "하와이안",
        english: "Hawaiian",
        price: 21900,
        image: "images/hawaiian.jpg",
        description:
            "달콤하고 상큼한 파인애플과 고소한 햄이 조화롭게 어우러진 트로피컬 피자."
    },
    {
        id: "super-supreme",
        name: "슈퍼 슈프림",
        english: "Super Supreme",
        price: 25900,
        image: "images/super-supreme.jpg",
        description:
            "다채로운 육류와 신선한 채소, 풍성한 치즈를 한 판에 담아낸 프리미엄 콤비네이션 피자."
    }
];


/* ========================================
   2. 사이즈 및 추가 옵션 가격
======================================== */

const sizeOptions = {
    M: {
        name: "Medium",
        price: 0
    },
    L: {
        name: "Large",
        price: 3000
    }
};

const doughs = [
    {
        id: "original",
        name: "오리지널 도우",
        price: 0
    },
    {
        id: "thin",
        name: "씬 도우",
        price: 0
    },
    {
        id: "cheese",
        name: "치즈 크러스트",
        price: 3000
    },
    {
        id: "sweet-potato",
        name: "고구마 크러스트",
        price: 3500
    }
];

const toppings = [
    {
        id: "mozzarella",
        name: "모차렐라 치즈",
        price: 2000
    },
    {
        id: "pepperoni",
        name: "페퍼로니",
        price: 1500
    },
    {
        id: "bacon",
        name: "베이컨",
        price: 2000
    },
    {
        id: "mushroom",
        name: "버섯",
        price: 1000
    },
    {
        id: "olive",
        name: "올리브",
        price: 1000
    },
    {
        id: "pineapple",
        name: "파인애플",
        price: 1500
    },
    {
        id: "jalapeno",
        name: "할라피뇨",
        price: 1000
    },
    {
        id: "shrimp",
        name: "새우",
        price: 3000
    }
];


/* ========================================
   3. 현재 주문 상태
======================================== */

let selectedPizza = pizzas[0].id;
let quantity = 1;

// 수량 입력값을 안전한 정수 범위로 제한
const MAX_QUANTITY = Number.MAX_SAFE_INTEGER;


/* ========================================
   4. HTML 요소 연결
======================================== */

const pizzaMenu = document.getElementById("pizzaMenu");
const doughOptions = document.getElementById("doughOptions");
const toppingOptions = document.getElementById("toppingOptions");

const mainPizzaImage = document.getElementById("mainPizzaImage");
const mainPizzaName = document.getElementById("mainPizzaName");
const mainPizzaEnglish = document.getElementById("mainPizzaEnglish");
const mainPizzaDescription = document.getElementById("mainPizzaDescription");

const quantityDisplay = document.getElementById("quantityDisplay");
const minusButton = document.getElementById("minusButton");
const plusButton = document.getElementById("plusButton");

const orderRequest = document.getElementById("orderRequest");

const summaryPizzaImage = document.getElementById("summaryPizzaImage");
const summaryPizzaName = document.getElementById("summaryPizzaName");
const summaryPizzaOptions = document.getElementById("summaryPizzaOptions");
const summaryToppings = document.getElementById("summaryToppings");

const basePriceElement = document.getElementById("basePrice");
const sizePriceElement = document.getElementById("sizePrice");
const doughPriceElement = document.getElementById("doughPrice");
const toppingPriceElement = document.getElementById("toppingPrice");
const unitPriceElement = document.getElementById("unitPrice");
const summaryQuantity = document.getElementById("summaryQuantity");
const totalPriceElement = document.getElementById("totalPrice");

const orderButton = document.getElementById("orderButton");
const resetButton = document.getElementById("resetButton");

const orderModal = document.getElementById("orderModal");
const modalOrderDetails = document.getElementById("modalOrderDetails");
const closeModalButton = document.getElementById("closeModalButton");


/* ========================================
   5. 원화 가격 표시 함수

   예: 19900 → 19,900원
======================================== */

function formatPrice(price) {
    return price.toLocaleString("ko-KR") + "원";
}


/* ========================================
   6. 이미지 관리

   이미지 파일이 없을 경우 기본 안내 이미지 표시
   별도의 기본 이미지 파일은 필요하지 않습니다.
======================================== */

const placeholderImage =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg"
             width="600"
             height="600"
             viewBox="0 0 600 600">

            <rect width="600"
                  height="600"
                  rx="15"
                  fill="#211b15"/>

            <circle cx="300"
                    cy="265"
                    r="135"
                    fill="none"
                    stroke="#9b7843"
                    stroke-width="3"/>

            <circle cx="300"
                    cy="265"
                    r="115"
                    fill="none"
                    stroke="#685137"
                    stroke-width="2"/>

            <path d="M300 130 V400
                     M165 265 H435
                     M205 170 L395 360
                     M395 170 L205 360"
                  stroke="#685137"
                  stroke-width="2"/>

            <text x="300"
                  y="465"
                  text-anchor="middle"
                  fill="#d5ad63"
                  font-size="24"
                  font-family="Georgia, serif"
                  letter-spacing="4">
                PIZZA HOUSE
            </text>

            <text x="300"
                  y="505"
                  text-anchor="middle"
                  fill="#a99b88"
                  font-size="18"
                  font-family="Arial, sans-serif">
                IMAGE COMING SOON
            </text>

        </svg>
    `);

function setPizzaImage(imageElement, imagePath, pizzaName) {

    // 동일한 이미지가 불필요하게 다시 로딩되는 것을 방지
    if (imageElement.dataset.imagePath === imagePath) {
        imageElement.alt = pizzaName + " 피자";
        return;
    }

    imageElement.dataset.imagePath = imagePath;
    imageElement.alt = pizzaName + " 피자";

    // 이미지 파일을 찾을 수 없는 경우
    imageElement.onerror = function () {

        // 오류가 반복되는 것을 방지
        imageElement.onerror = null;
        imageElement.src = placeholderImage;
    };

    imageElement.src = imagePath || placeholderImage;
}


/* ========================================
   7. 상단 피자 메뉴 자동 생성
======================================== */

function renderPizzaMenu() {

    pizzaMenu.replaceChildren();

    pizzas.forEach(function (pizza) {

        const card = document.createElement("button");

        card.type = "button";
        card.className = "pizza-card";
        card.dataset.pizzaId = pizza.id;
        card.setAttribute("aria-pressed", "false");

        // 피자 사진
        const image = document.createElement("img");

        setPizzaImage(image, pizza.image, pizza.name);

        // 한글 메뉴명
        const name = document.createElement("h3");

        name.textContent = pizza.name;

        // 영문 메뉴명
        const english = document.createElement("span");

        english.className = "card-english";
        english.textContent = pizza.english;

        // Medium 및 Large 가격
        const price = document.createElement("span");

        price.className = "card-price";

        price.textContent =
            "M " + formatPrice(pizza.price) +
            " / L " + formatPrice(
                pizza.price + sizeOptions.L.price
            );

        card.append(image, name, english, price);

        // 피자 메뉴 클릭 이벤트
        card.addEventListener("click", function () {

            selectedPizza = pizza.id;

            // 기존 사이즈, 도우, 토핑, 수량은 유지
            updateOrder();
        });

        pizzaMenu.appendChild(card);
    });
}


/* ========================================
   8. 도우 옵션 자동 생성
======================================== */

function renderDoughOptions() {

    doughOptions.replaceChildren();

    doughs.forEach(function (dough, index) {

        const label = document.createElement("label");

        label.className = "option-card";

        const input = document.createElement("input");

        input.type = "radio";
        input.name = "dough";
        input.value = dough.id;
        input.checked = index === 0;

        const content = document.createElement("span");

        content.className = "option-content";

        const name = document.createElement("span");

        name.textContent = dough.name;

        const price = document.createElement("small");

        if (dough.price === 0) {

            price.textContent =
                dough.id === "original" ? "기본" : "무료";

        } else {

            price.textContent = "+" + formatPrice(dough.price);

        }

        content.append(name, price);
        label.append(input, content);

        // 도우 선택 변경 시 자동 계산
        input.addEventListener("change", updateOrder);

        doughOptions.appendChild(label);
    });
}


/* ========================================
   9. 추가 토핑 옵션 자동 생성
======================================== */

function renderToppingOptions() {

    toppingOptions.replaceChildren();

    toppings.forEach(function (topping) {

        const label = document.createElement("label");

        label.className = "topping-item";

        const input = document.createElement("input");

        input.type = "checkbox";
        input.name = "topping";
        input.value = topping.id;

        const name = document.createElement("span");

        name.className = "topping-name";
        name.textContent = topping.name;

        const price = document.createElement("span");

        price.className = "topping-cost";
        price.textContent = "+" + formatPrice(topping.price);

        label.append(input, name, price);

        // 토핑 선택 및 해제 시 자동 계산
        input.addEventListener("change", updateOrder);

        toppingOptions.appendChild(label);
    });
}


/* ========================================
   10. 현재 선택된 주문 정보 가져오기
======================================== */

function getOrderDetails() {

    // 선택한 피자
    const pizza = pizzas.find(function (item) {
        return item.id === selectedPizza;
    });

    // 선택한 사이즈
    const selectedSize = document.querySelector(
        'input[name="size"]:checked'
    ).value;

    const size = sizeOptions[selectedSize];

    // 선택한 도우
    const selectedDough = document.querySelector(
        'input[name="dough"]:checked'
    ).value;

    const dough = doughs.find(function (item) {
        return item.id === selectedDough;
    });

    // 선택한 추가 토핑
    const checkedToppings = document.querySelectorAll(
        'input[name="topping"]:checked'
    );

    const selectedToppingIds = Array.from(
        checkedToppings,
        function (input) {
            return input.value;
        }
    );

    const selectedToppings = toppings.filter(function (item) {
        return selectedToppingIds.includes(item.id);
    });

    // 추가 토핑 총 금액
    const toppingPrice = selectedToppings.reduce(
        function (sum, topping) {
            return sum + topping.price;
        },
        0
    );

    // 피자 1판 가격
    const unitPrice =
        pizza.price +
        size.price +
        dough.price +
        toppingPrice;

    // 총 주문 금액
    const totalPrice = unitPrice * quantity;

    return {
        pizza: pizza,
        size: size,
        dough: dough,
        toppings: selectedToppings,
        toppingPrice: toppingPrice,
        unitPrice: unitPrice,
        quantity: quantity,
        totalPrice: totalPrice,
        request: orderRequest.value.trim()
    };
}


/* ========================================
   11. 주문 정보 및 금액 실시간 업데이트

   이전 가격에 금액을 더하는 방식이 아닌,
   현재 선택된 옵션을 기준으로 매번 다시 계산합니다.
======================================== */

function updateOrder() {

    const order = getOrderDetails();

    // 선택된 피자 메뉴 강조
    document.querySelectorAll(".pizza-card").forEach(
        function (card) {

            const isSelected =
                card.dataset.pizzaId === selectedPizza;

            card.classList.toggle("active", isSelected);

            card.setAttribute(
                "aria-pressed",
                String(isSelected)
            );
        }
    );

    // 왼쪽 대형 피자 이미지 및 설명 변경
    setPizzaImage(
        mainPizzaImage,
        order.pizza.image,
        order.pizza.name
    );

    mainPizzaName.textContent = order.pizza.name;
    mainPizzaEnglish.textContent = order.pizza.english;
    mainPizzaDescription.textContent = order.pizza.description;

    // 주문 수량 표시
    quantityDisplay.textContent = quantity;
    minusButton.disabled = quantity <= 1;

    plusButton.disabled =
        quantity >= MAX_QUANTITY ||
        quantity >= Math.floor(
            Number.MAX_SAFE_INTEGER / order.unitPrice
        );

    // 오른쪽 주문 내역 이미지
    setPizzaImage(
        summaryPizzaImage,
        order.pizza.image,
        order.pizza.name
    );

    // 피자 이름, 사이즈 및 도우
    summaryPizzaName.textContent = order.pizza.name;

    summaryPizzaOptions.textContent =
        order.size.name + " · " + order.dough.name;

    // 선택한 토핑 이름
    if (order.toppings.length === 0) {

        summaryToppings.textContent = "없음";

    } else {

        summaryToppings.textContent = order.toppings
            .map(function (topping) {
                return topping.name;
            })
            .join(", ");

    }

    // 세부 금액 표시
    basePriceElement.textContent =
        formatPrice(order.pizza.price);

    sizePriceElement.textContent =
        formatPrice(order.size.price);

    doughPriceElement.textContent =
        formatPrice(order.dough.price);

    toppingPriceElement.textContent =
        formatPrice(order.toppingPrice);

    unitPriceElement.textContent =
        formatPrice(order.unitPrice);

    summaryQuantity.textContent =
        order.quantity + "판";

    // 총 주문 금액
    totalPriceElement.textContent =
        formatPrice(order.totalPrice);
}


/* ========================================
   12. 주문 수량 조절
======================================== */

minusButton.addEventListener("click", function () {

    if (quantity > 1) {

        quantity--;

        updateOrder();
    }
});

plusButton.addEventListener("click", function () {

    if (!plusButton.disabled) {

        quantity++;

        updateOrder();
    }
});


/* ========================================
   13. 사이즈 변경 이벤트
======================================== */

document.querySelectorAll('input[name="size"]').forEach(
    function (input) {

        input.addEventListener("change", updateOrder);

    }
);


/* ========================================
   14. 전체 선택 초기화
======================================== */

function resetOrder() {

    // 기본 피자
    selectedPizza = pizzas[0].id;

    // 기본 사이즈
    document.querySelector(
        'input[name="size"][value="M"]'
    ).checked = true;

    // 기본 도우
    document.querySelector(
        'input[name="dough"][value="original"]'
    ).checked = true;

    // 추가 토핑 모두 해제
    document.querySelectorAll('input[name="topping"]').forEach(
        function (input) {

            input.checked = false;

        }
    );

    // 수량 초기화
    quantity = 1;

    // 요청사항 삭제
    orderRequest.value = "";

    // 화면 및 금액 다시 계산
    updateOrder();
}

resetButton.addEventListener("click", resetOrder);


/* ========================================
   15. 주문 팝업용 항목 생성 함수

   사용자 입력 내용은 textContent로 표시하여
   HTML 코드로 실행되지 않도록 처리합니다.
======================================== */

function createModalRow(labelText, valueText) {

    const row = document.createElement("div");

    row.className = "modal-detail-row";

    const label = document.createElement("span");

    label.textContent = labelText;

    const value = document.createElement("strong");

    value.textContent = valueText;

    row.append(label, value);

    return row;
}


/* ========================================
   16. 주문 완료 팝업
======================================== */

function showOrderModal() {

    const order = getOrderDetails();

    modalOrderDetails.replaceChildren();

    // 선택한 토핑 목록
    const toppingNames = order.toppings.length > 0
        ? order.toppings.map(function (topping) {
            return topping.name;
        }).join(", ")
        : "없음";

    // 최종 주문 정보
    const details = [
        ["피자", order.pizza.name],
        ["사이즈", order.size.name],
        ["도우", order.dough.name],
        ["추가 토핑", toppingNames],
        ["기본 가격", formatPrice(order.pizza.price)],
        ["사이즈 추가", formatPrice(order.size.price)],
        ["도우 추가", formatPrice(order.dough.price)],
        ["토핑 추가", formatPrice(order.toppingPrice)],
        ["1판 가격", formatPrice(order.unitPrice)],
        ["주문 수량", order.quantity + "판"]
    ];

    details.forEach(function (detail) {

        modalOrderDetails.appendChild(
            createModalRow(detail[0], detail[1])
        );

    });

    // 요청사항 표시
    const requestBox = document.createElement("div");

    requestBox.className = "modal-request";

    const requestTitle = document.createElement("strong");

    requestTitle.textContent = "주문 요청사항";

    const requestText = document.createElement("p");

    requestText.textContent = order.request || "없음";

    requestBox.append(requestTitle, requestText);

    modalOrderDetails.appendChild(requestBox);

    // 최종 금액 표시
    const totalBox = document.createElement("div");

    totalBox.className = "modal-total";

    const totalLabel = document.createElement("span");

    totalLabel.textContent = "최종 주문 금액";

    const totalValue = document.createElement("strong");

    totalValue.textContent = formatPrice(order.totalPrice);

    totalBox.append(totalLabel, totalValue);

    modalOrderDetails.appendChild(totalBox);

    // 팝업 열기
    if (!orderModal.open) {

        orderModal.showModal();

    }
}

orderButton.addEventListener("click", showOrderModal);


// 닫기 버튼
closeModalButton.addEventListener("click", function () {

    orderModal.close();

});

// 팝업 바깥 영역 클릭 시 닫기
orderModal.addEventListener("click", function (event) {

    if (event.target === orderModal) {

        const rect = orderModal.getBoundingClientRect();

        const isOutside =
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom;

        if (isOutside) {

            orderModal.close();

        }
    }
});

// 팝업 닫은 후 주문 버튼으로 포커스 복귀
orderModal.addEventListener("close", function () {

    orderButton.focus();

});


/* ========================================
   17. 웹페이지 최초 실행
======================================== */

renderPizzaMenu();

renderDoughOptions();

renderToppingOptions();

updateOrder();
