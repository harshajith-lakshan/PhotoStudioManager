$(document).ready(function () {
    let orders = [];
    let editingId = null;

    // Load orders from localStorage if available
    const savedOrders = localStorage.getItem("photoOrders");
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
        updateTable();
    }

    // Toggle form visibility
    $("#toggleForm").click(function () {
        const formContainer = $("#orderFormContainer");
        formContainer.toggle();
        $(this).text(formContainer.is(":visible") ? "Hide Form" : "Add New Order");
    });

    // Handle form submission
    $("#orderForm").on("submit", function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const order = {
            id: editingId || Date.now(),
            customerName: formData.get("customerName"),
            customerPhone: formData.get("customerPhone"),
            totalAmount: parseFloat(formData.get("totalAmount")),
            amountPaid: parseFloat(formData.get("amountPaid")),
            billNumber: formData.get("billNumber"),
            designerID: formData.get("designerID"),
            frameSize: formData.get("frameSize"),
            deliveryDate: formData.get("deliveryDate"),
            completionDate: formData.get("completionDate"),
            status: "pending",
        };

        if (editingId) {
            orders = orders.map((o) => (o.id === editingId ? order : o));
            editingId = null;
            $(this).find('button[type="submit"]').text("Create Order");
        } else {
            orders.unshift(order);
        }

        // Save to localStorage
        localStorage.setItem("photoOrders", JSON.stringify(orders));

        updateTable();
        this.reset();
    });

    // Calculate time remaining for execution
    function calculateRemainingTime(completionDate) {
        if (!completionDate) return "Not Set";
        const now = new Date();
        const endTime = new Date(completionDate);
        const diff = endTime - now;

        if (diff <= 0) return "Past Due";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${days}d ${hours}h ${minutes}m`;
    }

    // Update table with orders
    function updateTable() {
        const tbody = $("#orderTableBody");
        tbody.empty();

        orders.forEach((order) => {
            const row = $("<tr>");
            row.html(`
                <td>${order.customerName}</td>
                <td>${order.billNumber}</td>
                <td>Rs.${order.totalAmount.toFixed(2)}</td>
                <td>Rs.${order.amountPaid.toFixed(2)}</td>
                <td>Rs.${(order.totalAmount - order.amountPaid).toFixed(2)}</td>
                <td>${order.designerID}</td>
                <td>${order.frameSize || "N/A"}</td>
                <td>${order.deliveryDate}</td>
                <td>${order.completionDate || "Not Set"}</td>
                <td>${calculateRemainingTime(order.completionDate)}</td>
                <td>
                    <span class="badge ${order.status === "completed" ? "badge-completed" : "badge-pending"}">
                        ${order.status === "completed" ? "Completed" : "Pending"}
                    </span>
                </td>
                <td class="action-buttons">
                    <button class="btn btn-primary" onclick="editOrder(${order.id})">Edit</button>
                    ${order.status !== "completed" ? `<button class="btn btn-success" onclick="completeOrder(${order.id})">Complete</button>` : ""}
                    <button class="btn btn-danger" onclick="deleteOrder(${order.id})">Delete</button>
                </td>
            `);
            tbody.append(row);
        });
    }

    window.editOrder = function (id) {
        const order = orders.find((o) => o.id === id);
        if (order) {
            editingId = id;
            Object.keys(order).forEach((key) => {
                if (key !== "id" && key !== "status") {
                    $(`[name=${key}]`).val(order[key]);
                }
            });
            $("#orderForm button[type='submit']").text("Update Order");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    window.completeOrder = function (id) {
        orders = orders.map((order) =>
            order.id === id ? { ...order, status: "completed" } : order
        );
        localStorage.setItem("photoOrders", JSON.stringify(orders));
        updateTable();
    };

    window.deleteOrder = function (id) {
        orders = orders.filter((order) => order.id !== id);
        localStorage.setItem("photoOrders", JSON.stringify(orders));
        updateTable();
    };
});
// Show and hide form with animations
const showOrderForm = () => {
    orderForm.style.display = "block";
    orderForm.classList.add("show");
    orderForm.classList.remove("hide");
};

const hideOrderForm = () => {
    orderForm.classList.add("hide");
    orderForm.classList.remove("show");
    setTimeout(() => {
        orderForm.style.display = "none";
    }, 300); // Matches animation duration
};
