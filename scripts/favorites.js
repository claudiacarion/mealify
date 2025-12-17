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

window.addEventListener("DOMContentLoaded", () => {
  const favList = document.querySelector("#fav-list");
  const favs = JSON.parse(localStorage.getItem("Favorite foods") || "[]");
  if (!favList) return;
  favList.innerHTML = "";

  if (favs.length === 0) {
    favList.innerHTML = `<p class="empty">No foods added</p>`;
  } else {
    favs.forEach(meal => {
      const favItem = document.createElement("li");
      favItem.className = "fav-food";
      favItem.textContent = meal.name;
      favList.appendChild(favItem);
      console.log(meal.idMeal);

      const show = element => element.classList.remove("hide");
      const hide = element => element.classList.add("hide");

      favItem.onclick = () => {
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
          .then(response => {
            if (!response.ok) {
              throw new Error("Error!");
            }
            return response.json();
          })
          .then(data => {
            show(document.querySelector("#food-card"));
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
        const readMoreBtn = document.querySelector("#food__read-more-btn");

        show(readMoreBtn);
        const favBtn = document.querySelector("#fav-btn");
        show(favBtn);

        favBtn.textContent = isInFavorites(mealID) ? "Remove from favorites" : "Add to favorites";

        favBtn.onclick = () => {
          if (isInFavorites(mealID)) {
            removeFromFavorites(mealID);
            favItem.remove();
            hide(document.querySelector("#food-card"));
            favBtn.textContent = "Add to favorites";
            if (favList.children.length === 0) {
              favList.innerHTML = `<p class="empty">No foods added</p>`;
            }
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

        document.querySelector("#food__read-more-btn").onclick = () => {
          document.querySelector("#recipe").classList.toggle("hide");
        };
      };
    });
  }
});
