let items = JSON.parse(localStorage.getItem("items")) || [];

function renderTable() {
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";

    let totalProfit = 0;

    items.forEach((item, index) => {
        const profit = (item.sellingPrice - item.purchasePrice) * item.portionsSold;
        totalProfit += profit;

        const row = `
            <tr>
                <td>${item.name}</td>
                <td>${item.purchasePrice.toFixed(2)}</td>
                <td>${item.sellingPrice.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>${item.portionsSold}</td>
                <td>${profit.toFixed(2)}</td>
                <td>
                    <button onclick="sellPortion(${index})">Sell Portion</button>
                    <button onclick="deleteItem(${index})">Delete</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    document.getElementById("profit").textContent = totalProfit.toFixed(2);
}

function addItem() {
    const name = document.getElementById("name").value;
    const purchasePrice = parseFloat(document.getElementById("purchasePrice").value);
    const sellingPrice = parseFloat(document.getElementById("sellingPrice").value);
    const quantity = parseInt(document.getElementById("quantity").value);

    if (!name || isNaN(purchasePrice) || isNaN(sellingPrice) || isNaN(quantity)) {
        alert("Please fill all fields correctly");
        return;
    }

    items.push({
        name,
        purchasePrice,
        sellingPrice,
        quantity,
        portionsSold: 0
    });

    localStorage.setItem("items", JSON.stringify(items));
    renderTable();
    document.getElementById("name").value = "";
    document.getElementById("purchasePrice").value = "";
    document.getElementById("sellingPrice").value = "";
    document.getElementById("quantity").value = "";
}

function sellPortion(index) {
    if (items[index].quantity > 0) {
        items[index].quantity -= 1;
        items[index].portionsSold += 1;
        localStorage.setItem("items", JSON.stringify(items));
        renderTable();
    } else {
        alert("No more portions available");
    }
}

function deleteItem(index) {
    if (confirm("Are you sure you want to delete this item?")) {
        items.splice(index, 1);
        localStorage.setItem("items", JSON.stringify(items));
        renderTable();
    }
}

document.addEventListener("DOMContentLoaded", renderTable);
