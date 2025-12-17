const show = element => element.classList.remove("hide");
const hide = element => element.classList.add("hide");

const saveFavorites = list => localStorage.setItem("Favorite foods", JSON.stringify(list));
const getFavorites = () => JSON.parse(localStorage.getItem("Favorite foods") || "[]");

const isInFavorites = mealID => {
  const fav = getFavorites();
  return fav.some(meal => meal.idMeal === mealID);
};

const addToFavorites = meal => {
  const fav = getFavorites();

  if (fav.some(f => f.idMeal === meal.idMeal)) {
    return;
  }

  const favFood = {
    idMeal: meal.idMeal,
    name: meal.strMeal,
  };

  fav.push(favFood);
  saveFavorites(fav);
};

const removeFromFavorites = mealID => {
  const fav = getFavorites();
  const updateList = fav.filter(meal => meal.idMeal !== mealID);
  saveFavorites(updateList);
};

const list = () => {
  fetch("https://www.themealdb.com/api/json/v1/1/list.php?c=list")
    .then(response => {
      if (!response.ok) {
        throw new Error("Error!");
      }
      return response.json();
    })
    .then(data => {
      data.meals.forEach(item => {
        let option = document.createElement("option");
        option.value = item.strCategory.toLowerCase();
        option.text = item.strCategory;
        option.class = "list-item";
        document.querySelector("#categoryList").appendChild(option);
      });
    })
    .catch(error => {
      console.error("Error: ", error);
    });
};
list();

const fetchCategory = category => {
  fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Error!");
      }
      return response.json();
    })
    .then(data => {
      const randomFood = data.meals[Math.floor(Math.random() * data.meals.length)];
      return fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${randomFood.idMeal}`);
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Error!");
      }
      return response.json();
    })
    .then(data => {
      displayFood(data.meals[0]);
    })
    .catch(error => {
      console.error("Error: ", error);
    });
};

const fetchRecipes = () => {
  fetch("https://www.themealdb.com/api/json/v1/1/random.php")
    .then(response => {
      if (!response.ok) {
        throw new Error("Error!");
      }
      return response.json();
    })
    .then(data => {
      displayFood(data.meals[0]);
    })
    .catch(error => {
      console.error("Error: ", error);
    });
};

const displayFood = meal => {
  const image = document.querySelector("#food-image");
  image.src = meal.strMealThumb;
  image.height = "150";

  const mealID = meal.idMeal;

  document.querySelector("#food-card__title").textContent = meal.strMeal;
  document.querySelector("#food-origin").textContent = `Culinary origin: ${meal.strArea}`;

  show(readMoreBtn);
  const favBtn = document.querySelector("#fav-btn");
  show(favBtn);

  favBtn.textContent = isInFavorites(mealID) ? "Remove from favorites" : "Add to favorites";

  favBtn.onclick = () => {
    if (isInFavorites(mealID)) {
      removeFromFavorites(mealID);
      favBtn.textContent = "Add to favorites";
    } else {
      addToFavorites(meal);
      favBtn.textContent = "Remove from favorites";
    }
  };

  const recipe = document.querySelector("#recipe");
  recipe.innerHTML = "";

  const ingredientsList = [];

  Object.keys(meal).forEach(key => {
    if (key.startsWith("strIngredient") && meal[key]) {
      const ingredient = meal[key];
      const index = key.replace("strIngredient", "");
      const measurement = meal[`strMeasure${index}`] || "";
      ingredientsList.push(`${ingredient}: ${measurement}`);
    }
  });

  const instructions = document.createElement("div");
  instructions.innerHTML = `
  <ul class="info" id="ingredients-list"></ul>
  <div class="info" id="steps">${meal.strInstructions}</div>
  `;
  recipe.appendChild(instructions);

  const ul = document.querySelector("#ingredients-list");
  ingredientsList.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    ul.appendChild(li);
  });
};

const readMoreBtn = document.querySelector("#food__read-more-btn");
readMoreBtn.onclick = () => {
  document.querySelector("#recipe").classList.toggle("hide");
};

const selectCategory = document.querySelector("#categoryList");
selectCategory.addEventListener("change", e => {
  const selected = e.target.value;
  if (!selected) return;
  fetchCategory(selected);
  hide(document.querySelector("#recipe"));
});

const foodBtn = document.querySelector("#food-btn");
foodBtn.onclick = () => {
  selectCategory.value = "";
  fetchRecipes();
  hide(document.querySelector("#recipe"));
};
