// ? ================> Global ================>

let fromCategory = true;
const loading = $("#loading");
const row = $(".meals-container .row");

// ! ================> When Start ================>
//side nav
const navWidth = $(".nav-tab").outerWidth();
const sideNav = $(".side-nav-menu");
const links = $(".links ul li");

$(document).ready(function () {
  closeNav();
  getMeals();
});

// * ================> Events  ================>
//side nav
function openNav() {
  $(".toggle-icon").removeClass("fa-bars").addClass("fa-x");
  sideNav.animate({ left: 0 }, 500);
  sideNav.attr("data-nav", "opened");

  links.each((i, link) => {
    $(link).animate(
      {
        top: 0,
      },
      (i + 5) * 100
    );
  });
}

function closeNav() {
  sideNav.animate({ left: -navWidth }, 500);
  $(".toggle-icon").addClass("fa-bars").removeClass("fa-x");
  sideNav.attr("data-nav", "closed");
  links.animate({ top: 150 });
}

$(".toggle-icon").click(function () {
  const isClosed = sideNav.attr("data-nav");

  if (isClosed === "closed") {
    openNav();
  } else {
    closeNav();
  }
});

links.eq(0).click(() => {
  showPreloader();
  closeNav();
  displayInputs();
});

links.eq(1).click(() => {
  showPreloader();
  closeNav();
  getMealsCategories();
});

links.eq(2).click(() => {
  showPreloader();
  closeNav();
  getArea();
});

links.eq(3).click(() => {
  showPreloader();
  closeNav();
  getIngredient();
});

links.eq(4).click(() => {
  showPreloader();
  closeNav();
  displayContact();
});

// ! ================> Functions  ================>

function showPreloader() {
  loading.fadeIn(300);
}

function hidePreloader() {
  loading.fadeOut(300);
}

async function getMeals() {
  try {
    showPreloader();
    const response = await fetch(
      "https://www.themealdb.com/api/json/v1/1/search.php?s="
    );
    const data = await response.json();
    const meals = data.meals.slice(0, 20);
    displayMeals(meals);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    hidePreloader();
  }
}

function displayMeals(meals) {
  if (!meals) {
    console.error("No meals found.");
    row.html("<p>No meals found for the selected ingredient.</p>");
    return;
  }

  const container = meals
    .map(
      (meal) => `
      <div class="col-md-3 meal" data-index=${meal.idMeal}>
        <div class="meal-img position-relative overflow-hidden">
          <div class="img-layer position-absolute w-100 h-100 d-flex align-items-center cursor-pointer">
            <h3 class="text-black ms-2">${meal.strMeal}</h3>
          </div>
          <img src="${meal.strMealThumb}" alt='${meal.strMeal}' class="img-fluid">
        </div>
      </div>
    `
    )
    .join("");

  row.html(container);
  addMealEventListeners();
}

function addMealEventListeners() {
  $(".row .meal").on("click", function () {
    if ($(this).data("index")) {
      const mealId = $(this).data("index");
      getMealsDetails(mealId);
    }

    if ($(this).data("category")) {
      const mealCategory = $(this).data("category");
      getMealsCategoryAndArea(mealCategory);
    }

    if ($(this).data("ingredients")) {
      const mealIngredients = $(this).data("ingredients");
      console.log(mealIngredients);
      getMealsIngredients(mealIngredients);
    }
  });
}

async function getMealsDetails(id) {
  try {
    showPreloader();
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );
    const data = await response.json();
    const mealDetails = data.meals;
    displayMealsDetails(mealDetails);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    hidePreloader();
  }
}

function displayMealsDetails(meal) {
  closeNav();
  let ingredients = "";
  let tags = "";

  for (let i = 1; i <= 20; i++) {
    if (meal[0][`strIngredient${i}`]) {
      ingredients += `<li class="alert alert-info m-2 p-1">${
        meal[0][`strMeasure${i}`]
      } ${meal[0][`strIngredient${i}`]}</li>`;
    }
  }

  if (meal[0].strTags) {
    const tagList = meal[0].strTags.split(",");
    tags = tagList
      .map((tag) => `<li class="alert alert-danger m-2 p-1">${tag}</li>`)
      .join("");
  }

  const container = `
      <div class="col-md-4">
        <img class="w-100 rounded-3" src="${meal[0].strMealThumb}" alt='${
    meal[0].strMeal
  }'>
        <h2>${meal[0].strMeal}</h2>
      </div>
      <div class="col-md-8">
        <h2>Instructions</h2>
        <p>${meal[0].strInstructions}</p>
        <h3><span class="fw-bolder">Area : </span>${meal[0].strArea}</h3>
        <h3><span class="fw-bolder">Category : </span>${
          meal[0].strCategory
        }</h3>
        <h3>Recipes :</h3>
        <ul class="list-unstyled d-flex g-3 flex-wrap">
          ${ingredients}
        </ul>
        <h3>Tags : </h3>
        <ul class="list-unstyled d-flex g-3 flex-wrap">
          ${tags || "food"}
        </ul>
        <a target="_blank" href="${
          meal[0].strSource
        }" class="btn btn-success">Source</a>
        <a target="_blank" href="${
          meal[0].strYoutube
        }" class="btn btn-danger">Youtube</a>
      </div>
    `;

  row.html(container);
}

// category

async function getMealsCategories() {
  try {
    showPreloader();
    const response = await fetch(
      "https://www.themealdb.com/api/json/v1/1/categories.php"
    );
    const data = await response.json();
    displayCategories(data.categories);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    hidePreloader();
  }
}

function displayCategories(categories) {
  const container = categories
    .map(
      (category) => `
      <div class="col-md-3 meal" data-index=false data-category=${category.strCategory.replace(
        / /g,
        "_"
      )}>
        <div class="meal-img position-relative overflow-hidden">
          <div class="img-layer position-absolute w-100 h-100 text-center text-black cursor-pointer">
            <h3 class="text-black ms-2">${category.strCategory}</h3>
            <p class="text-category px-2">${category.strCategoryDescription}</p>
          </div>
          <img src="${category.strCategoryThumb}" alt='${
        category.strCategory
      }' class="img-fluid">
        </div>
      </div>
    `
    )
    .join("");

  row.html(container);
  addMealEventListeners();
}

// area
async function getArea() {
  try {
    showPreloader();
    const response = await fetch(
      "https://www.themealdb.com/api/json/v1/1/list.php?a=list"
    );
    const data = await response.json();
    displayArea(data.meals);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    hidePreloader();
  }
}

function displayArea(meals) {
  const container = meals
    .map(
      (area) => `
      <div class="col-md-3 meal" data-index=false data-category=${area.strArea}>
        <div class="rounded-2 text-center cursor-pointer">
          <i class="fa-solid fa-house-laptop fa-4x"></i>
          <h3>${area.strArea}</h3>
        </div>
      </div>
    `
    )
    .join("");

  row.html(container);
  fromCategory = false;
  addMealEventListeners();
}

async function getMealsCategoryAndArea(mealCategory) {
  const url = fromCategory
    ? `https://www.themealdb.com/api/json/v1/1/filter.php?c=${mealCategory}`
    : `https://www.themealdb.com/api/json/v1/1/filter.php?a=${mealCategory}`;

  fromCategory = true;

  try {
    showPreloader();
    closeNav();
    const response = await fetch(url);
    const data = await response.json();
    displayMeals(data.meals);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    hidePreloader();
  }
}

async function getIngredient() {
  try {
    showPreloader();
    const response = await fetch(
      "https://www.themealdb.com/api/json/v1/1/list.php?i=list"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.meals) {
      throw new Error('Data is missing the "meals" property.');
    }

    displayIngredients(data.meals);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    hidePreloader();
  }
}

function displayIngredients(meals) {
  let container = "";

  const limit = Math.min(meals.length, 20);

  for (let i = 0; i < limit; i++) {
    container += `
      <div class="col-md-3 meal" data-ingredients="${meals[
        i
      ].strIngredient.replace(/ /g, "_")}">
        <div class="rounded-2 text-center cursor-pointer">
          <img src="https://www.themealdb.com/images/ingredients/${
            meals[i].strIngredient
          }-small.png" alt="${meals[i].strIngredient}">
          <h3>${meals[i].strIngredient}</h3>
          <p class="text-category">${meals[i].strDescription}</p>
        </div>
      </div>
    `;
  }

  $(".row").html(container);
  addMealEventListeners();
}

async function getMealsIngredients(mealIngredient) {
  try {
    showPreloader();
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?i=${mealIngredient}`
    );

    const data = await response.json();

    if (!data.meals) {
      throw new Error('Data is missing the "meals" property.');
    }

    displayMeals(data.meals);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    hidePreloader();
  }
}

//search

function displayInputs() {
  const searchContainer = `
    <div class="container" id="searchContainer">
      <div class="row py-4 w-75 m-auto">
        <div class="col-md-6">
          <input class="form-control bg-transparent text-white" type="text" placeholder="Search By Name">
        </div>
        <div class="col-md-6">
          <input class="form-control bg-transparent text-white" type="text" placeholder="Search By First Letter" max="1">
        </div>
      </div>
      <div class="meals-display row g-3"></div>
    </div>
  `;

  row.html(searchContainer);
  hidePreloader();
  searchMeals();
}

function searchMeals() {
  const nameInput = $(".row .form-control").eq(0);
  const letterInput = $(".row .form-control").eq(1);

  nameInput.keyup(() => {
    searchData(nameInput.val());
  });

  letterInput.keyup(() => {
    searchData(letterInput.val());
  });
}

async function searchData(query) {
  try {
    showPreloader();
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
    );
    const data = await response.json();
    const meals = data.meals;
    displaySearch(meals);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    hidePreloader();
  }
}

function displaySearch(meals) {
  if (!meals) {
    console.error("No meals found.");
    $(".meals-display").html("<p>No meals found.</p>");
    return;
  }

  const container = meals
    .map(
      (meal) => `
    <div class="col-md-3 meal" data-index=${meal.idMeal}>
      <div class="meal-img position-relative overflow-hidden">
        <div class="img-layer position-absolute w-100 h-100 d-flex align-items-center cursor-pointer">
          <h3 class="text-black ms-2">${meal.strMeal}</h3>
        </div>
        <img src="${meal.strMealThumb}" alt='${meal.strMeal}' class="img-fluid">
      </div>
    </div>
  `
    )
    .join("");

  $(".meals-display").html(container);
  addMealEventListeners();
}

//contact us

function displayContact() {
  const container = `
  <div class="contact min-vh-100 d-flex justify-content-center align-items-center">
    <div class="container w-75 text-center">
      <form id="contactForm">
        <fieldset class="row g-4">
          <div class="col-md-6">
            <input id="nameInput" type="text" class="form-control" placeholder="Enter Your Name" data-touched="false">
            <div id="nameAlert" class="alert alert-danger w-100 mt-2 d-none">
              Special characters and numbers not allowed
            </div>
          </div>
          <div class="col-md-6">
            <input id="emailInput" type="email" class="form-control" placeholder="Enter Your Email" data-touched="false">
            <div id="emailAlert" class="alert alert-danger w-100 mt-2 d-none">
              Email not valid *example@yyy.zzz*
            </div>
          </div>
          <div class="col-md-6">
            <input id="phoneInput" type="text" class="form-control" placeholder="Enter Your Phone" data-touched="false">
            <div id="phoneAlert" class="alert alert-danger w-100 mt-2 d-none">
              Enter valid Phone Number
            </div>
          </div>
          <div class="col-md-6">
            <input id="ageInput" type="number" class="form-control" placeholder="Enter Your Age" data-touched="false">
            <div id="ageAlert" class="alert alert-danger w-100 mt-2 d-none">
              Enter valid age
            </div>
          </div>
          <div class="col-md-6">
            <input id="passwordInput" type="password" class="form-control" placeholder="Enter Your Password" data-touched="false">
            <div id="passwordAlert" class="alert alert-danger w-100 mt-2 d-none">
              Enter valid password *Minimum eight characters, at least one letter and one number:*
            </div>
          </div>
          <div class="col-md-6">
            <input id="repasswordInput" type="password" class="form-control" placeholder="Repassword" data-touched="false">
            <div id="repasswordAlert" class="alert alert-danger w-100 mt-2 d-none">
              Passwords do not match
            </div>
          </div>
        </fieldset>
        <button id="submitBtn" disabled class="btn btn-outline-danger px-2 mt-3">Submit</button>
      </form>
    </div>
  </div>
`;

  row.html(container);
  hidePreloader();

  const submitBtn = $("#submitBtn");

  function updateSubmitButtonState() {
    if (
      nameValidation() &&
      emailValidation() &&
      phoneValidation() &&
      ageValidation() &&
      passwordValidation() &&
      repasswordValidation()
    ) {
      submitBtn.removeAttr("disabled");
      submitBtn.css("cursor", "pointer");
    } else {
      submitBtn.attr("disabled", "disabled");
      submitBtn.css("cursor", "not-allowed");
    }
  }

  function nameValidation() {
    const isValid = /^[a-zA-Z ]+$/.test($("#nameInput").val());
    if ($("#nameInput").data("touched")) {
      $("#nameAlert").toggleClass("d-none", isValid);
    }
    return isValid;
  }

  function emailValidation() {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("#emailInput").val());
    if ($("#emailInput").data("touched")) {
      $("#emailAlert").toggleClass("d-none", isValid);
    }
    return isValid;
  }

  function phoneValidation() {
    const isValid =
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
        $("#phoneInput").val()
      );
    if ($("#phoneInput").data("touched")) {
      $("#phoneAlert").toggleClass("d-none", isValid);
    }
    return isValid;
  }

  function ageValidation() {
    const isValid = /^(0?[1-9]|[1-9][0-9]|1[01][0-9]|200)$/.test(
      $("#ageInput").val()
    );
    if ($("#ageInput").data("touched")) {
      $("#ageAlert").toggleClass("d-none", isValid);
    }
    return isValid;
  }

  function passwordValidation() {
    const isValid = /^(?=.*\d)(?=.*[a-z])[0-9a-zA-Z]{8,}$/.test(
      $("#passwordInput").val()
    );
    if ($("#passwordInput").data("touched")) {
      $("#passwordAlert").toggleClass("d-none", isValid);
    }
    return isValid;
  }

  function repasswordValidation() {
    const isValid = $("#repasswordInput").val() === $("#passwordInput").val();
    if ($("#repasswordInput").data("touched")) {
      $("#repasswordAlert").toggleClass("d-none", isValid);
    }
    return isValid;
  }

  // Events
  $("#nameInput").on("input", () => {
    $("#nameInput").data("touched", true);
    nameValidation();
    updateSubmitButtonState();
  });
  $("#emailInput").on("input", () => {
    $("#emailInput").data("touched", true);
    emailValidation();
    updateSubmitButtonState();
  });
  $("#phoneInput").on("input", () => {
    $("#phoneInput").data("touched", true);
    phoneValidation();
    updateSubmitButtonState();
  });
  $("#ageInput").on("input", () => {
    $("#ageInput").data("touched", true);
    ageValidation();
    updateSubmitButtonState();
  });
  $("#passwordInput").on("input", () => {
    $("#passwordInput").data("touched", true);
    passwordValidation();
    updateSubmitButtonState();
  });
  $("#repasswordInput").on("input", () => {
    $("#repasswordInput").data("touched", true);
    repasswordValidation();
    updateSubmitButtonState();
  });
}
