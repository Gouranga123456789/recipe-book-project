document.addEventListener("DOMContentLoaded", () => {
    
    const homeBtn = document.getElementById("homeBtn");
    const recipeForm = document.getElementById("addRecipeForm");
    const recipeListContainer = document.getElementById("recipeListContainer");
    const toggleFormBtn = document.getElementById("toggleFormBtn");

    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn"); 

    const recipeNameInput = document.getElementById("recipeName");
    const recipeIngredientsInput = document.getElementById("recipeIngredients");
    const recipeStepsInput = document.getElementById("recipeSteps");
    const recipeImageInput = document.getElementById("recipeImage");

    const modalOverlay = document.getElementById("recipeModal");
    const closeModalBtn = document.querySelector(".close-modal");
    const modalName = document.getElementById("modalName");
    const modalImage = document.getElementById("modalImage");
    const modalIngredients = document.getElementById("modalIngredients");
    const modalSteps = document.getElementById("modalSteps");

    let recipes = getRecipesFromStorage();

    function getRecipesFromStorage() {
        try {
            const recipes = localStorage.getItem("recipes");
            return recipes ? JSON.parse(recipes) : [];
        } catch (error) {
            console.error("Error loading recipes", error);
            return [];
        }
    }

    function saveRecipesToStorage(recipes) {
        try {
            localStorage.setItem("recipes", JSON.stringify(recipes));
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                alert("Storage is full! This browser allows only ~5MB of local storage. Please delete some recipes or use smaller images.");
            } else {
                alert("An error occurred while saving.");
            }
            console.error("Storage failed:", error);
            return false; 
        }
    }
    function renderRecipes(recipesToRender = recipes, searchTerm = "") {
        recipeListContainer.innerHTML = ""; 

        if (recipesToRender.length === 0) {
            if (searchTerm) {
                recipeListContainer.innerHTML = `<p class="no-results-msg">No results found for "${searchTerm}"</p>`;
            } else {
                recipeListContainer.innerHTML = `<p class="no-results-msg">No recipes added yet. Add one to get started!</p>`;
            }
            return;
        }

        recipesToRender.forEach(recipe => {
            const card = document.createElement("article");
            card.className = "recipe-card";
            card.dataset.id = recipe.id;

            const ingredientsPreview = recipe.ingredients.split(',').slice(0, 4).join(', ') + '...';

            card.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.name}">
                <div class="recipe-card-content">
                    <h3>${recipe.name}</h3>
                    <p><strong>Ingredients:</strong> ${ingredientsPreview}</p>
                </div>
            `;
            
            card.addEventListener("click", () => openRecipeModal(recipe));
            recipeListContainer.appendChild(card);
        });
    }

    function openRecipeModal(recipe) {
        modalName.textContent = recipe.name;
        modalImage.src = recipe.image;
        modalImage.alt = recipe.name;
        modalIngredients.textContent = recipe.ingredients
                                          .split(',')
                                          .map(ing => '• ' + ing.trim())
                                          .join('\n');

        modalSteps.textContent = recipe.steps;
        
        modalOverlay.classList.remove("hidden");
    }

    function closeRecipeModal() {
        modalOverlay.classList.add("hidden");
    }

    
    function handleAddRecipe(e) {
        e.preventDefault();

        const name = recipeNameInput.value.trim();
        const ingredients = recipeIngredientsInput.value.trim();
        const steps = recipeStepsInput.value.trim();
        const imageFile = recipeImageInput.files[0];

        if (!name || !ingredients || !steps || !imageFile) {
            alert("Please fill out all fields and upload an image.");
            return;
        }

        const maxSizeInBytes = 512000; 

        if (imageFile.size > maxSizeInBytes) {
            alert("The selected image is too large. Please select an image smaller than 500KB to save storage space.");
            return; 
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const newRecipe = {
                id: Date.now(),
                name: name,
                ingredients: ingredients,
                steps: steps,
                image: event.target.result
            };

            const saveSuccessful = saveRecipesToStorage([...recipes, newRecipe]);

            if (saveSuccessful) {
                recipes.push(newRecipe);
                searchInput.value = "";
                renderRecipes(recipes);

                recipeForm.reset();
                recipeForm.classList.add("hidden");
                toggleFormBtn.textContent = "Add New Recipe";
            } else {
                console.log("Save failed, keeping form open for user correction.");
            }
        };
        
        reader.readAsDataURL(imageFile);
    }

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        const filteredRecipes = recipes.filter(recipe => 
            recipe.name.toLowerCase().includes(searchTerm) ||
            recipe.ingredients.toLowerCase().includes(searchTerm)
        );
        
        renderRecipes(filteredRecipes, searchTerm);
    }

    function handleGoHome() {
        searchInput.value = ""; 
        renderRecipes(recipes); 
    }

    function toggleRecipeForm() {
        const isHidden = recipeForm.classList.toggle("hidden");
        toggleFormBtn.textContent = isHidden ? "Add New Recipe" : "Cancel";
    }

    homeBtn.addEventListener("click", handleGoHome);
    recipeForm.addEventListener("submit", handleAddRecipe);
    toggleFormBtn.addEventListener("click", toggleRecipeForm);
    
    searchBtn.addEventListener("click", handleSearch);
    
    searchInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    });

    closeModalBtn.addEventListener("click", closeRecipeModal);
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
            closeRecipeModal();
        }
    });

    renderRecipes(recipes); 
});
