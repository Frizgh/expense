let period = "day";
let count = 0;

function roundUpToTwo(num) {
  return Math.ceil(num * 100) / 100;
}

function getTotalExpense() {
  let expense_price = $(".expense_price");
  let last_expense_price = roundUpToTwo(parseFloat(expense_price.last().text().replace(",", "")));
  if (!isNaN(last_expense_price)) {
    count += last_expense_price;
  }
}

function get_month_results() {
  let income = parseFloat($("#income").html()) || 0;
  let expense = parseFloat($("#expense").html()) || 0;
  let result_text = roundUpToTwo(income - expense);
  $('#result').html(result_text);
  let result_text_number = parseFloat(result_text);
  if (result_text_number < 0) {
    $('#result').css('color', 'red');
  } else {
    $('#result').css('color', 'green');
  }
}

function updateExpenseBlock(expense_name, expense_price, multiplier) {
  let values = JSON.parse(localStorage.getItem('expense')) || [];

  if (expense_name.trim() !== "" && expense_price > 0) {
    let existingExpense = values.find(exp => exp[0] === expense_name);

    if (existingExpense) {
      existingExpense[1] += expense_price;
    } else {
      values.push([expense_name, expense_price]);
    }

    localStorage.setItem('expense', JSON.stringify(values));
  }

  $(".expense_container").empty();
  count = 0;

  values.forEach(([name, price]) => {
    let roundedPrice = roundUpToTwo(price * multiplier);
    $(".expense_container").append(`
      <div class="expense_block_day">
        <div class="expense_names">${name}:</div>
        <div class="expense_price">${roundedPrice} $</div>
        <div class="expense_button">
          <button class="expense_block-button_edit"></button>
          <button class="expense_block-button_delete"></button>
        </div>
      </div>
    `);
    count += roundedPrice;
  });

  $(".count_total").html(`Total expense: ${roundUpToTwo(count)} $`);
  $('#expense').html(`${roundUpToTwo(count * 30)} $`);
  get_month_results();
}

$(".btn.expense").on("click", function () {
  let expense_name = $(".expense_name_input").val();
  let expense_price = parseFloat($(".expense_price_input").val()) || 0;
  let multiplier = 1;

  switch (period) {
    case "week":
      multiplier = 7;
      break;
    case "month":
      multiplier = 30;
      break;
  }

  updateExpenseBlock(expense_name, expense_price, multiplier);
});

function updateExpenses(multiplier, newPeriod) {
  let expenseBlocks = $(".expense_block_day");
  expenseBlocks.each(function () {
    let expensePriceElement = $(this).find(".expense_price");
    let currentExpensePrice = roundUpToTwo(parseFloat(expensePriceElement.text().replace(",", "")));
    let newExpensePrice = roundUpToTwo(currentExpensePrice * multiplier);
    expensePriceElement.text(`${newExpensePrice} $`);
  });
  count *= multiplier;
  period = newPeriod;
  $(".count_total").html(`Total expense: ${roundUpToTwo(count)} $`);
  get_month_results();
}

$(".expense-day").on("click", function () {
  if (period === "week") {
    updateExpenses(1 / 7, "day");
  } else if (period === "month") {
    updateExpenses(1 / 30, "day");
  }
});

$(".expense-week").on("click", function () {
  if (period === "month") {
    updateExpenses(7 / 30, "week");
  } else if (period === "day") {
    updateExpenses(7, "week");
  }
});

$(".expense-month").on("click", function () {
  if (period === "week") {
    updateExpenses(30 / 7, "month");
  } else if (period === "day") {
    updateExpenses(30, "month");
  }
});

function takeReplaceIncomeValue() {
  let income_value = parseFloat($("#input_income").val()) || 0;
  localStorage.setItem('income', income_value);
  
  $("#income").html(income_value);
  $("#input_income").val('');
  get_month_results();
}

function updateLocalStorage(values) {
  localStorage.setItem('expense', JSON.stringify(values));
  count = values.reduce((sum, expense) => sum + roundUpToTwo(expense[1]), 0);
  $(".count_total").html(`Total expense: ${roundUpToTwo(count)} $`);
  $('#expense').html(`${roundUpToTwo(count * 30)} $`);
  get_month_results();
}

function handleDeleteExpense() {
  $(document).on("click", ".expense_block-button_delete", function () {
    const expenseBlock = $(this).closest(".expense_block_day");
    const expenseName = expenseBlock.find("div:first-child").text().replace(':', '');
    const expensePrice = parseFloat(expenseBlock.find(".expense_price").text().replace(" $", ""));
    
    let values = JSON.parse(localStorage.getItem('expense')) || [];
    
    values = values.filter(expense => expense[0] !== expenseName || expense[1] !== expensePrice);
    expenseBlock.remove();
    
    updateLocalStorage(values);
  });
}

function handleEditExpense() {
  $(document).on("click", ".expense_block-button_edit", function () {
    const expenseBlock = $(this).closest(".expense_block_day");
    const expenseName = expenseBlock.find("div:first-child").text().replace(':', '');
    const currentPrice = parseFloat(expenseBlock.find(".expense_price").text().replace(" $", ""));

    let newPrice = prompt(`Измените цену для '${expenseName}':`, currentPrice);
    newPrice = roundUpToTwo(parseFloat(newPrice));

    if (!isNaN(newPrice) && newPrice >= 0) {
      let values = JSON.parse(localStorage.getItem('expense')) || [];
      let expenseToUpdate = values.find(exp => exp[0] === expenseName);

      if (expenseToUpdate) {
        expenseToUpdate[1] = newPrice;
        updateLocalStorage(values);
        expenseBlock.find(".expense_price").text(`${newPrice} $`);
      }
    } else {
      alert('Введите корректную цену.');
    }
  });
}

handleDeleteExpense();
handleEditExpense();

$(document).ready(function () {
  let storedIncome = parseFloat(localStorage.getItem('income')) || 0;
  $("#income").html(storedIncome);
  let storedExpenses = JSON.parse(localStorage.getItem('expense')) || [];
  storedExpenses.forEach(([name, price]) => {
    if (name.trim() !== "" && price > 0) {
      count += price;
      $(".expense_container").append(`
        <div class="expense_block_day">
          <div class="expense_names">${name}:</div>
          <div class="expense_price">${roundUpToTwo(price)} $</div>
          <div class="expense_button">
            <button class="expense_block-button_edit"></button>
            <button class="expense_block-button_delete"></button>
          </div>
        </div>
      `);
    }
  });
  
  $(".count_total").html(`Total expense: ${roundUpToTwo(count)} $`);
  $('#expense').html(`${roundUpToTwo(count * 30)}`);
  
  get_month_results();
});

$('.btn.add_income').on('click', takeReplaceIncomeValue);
