import React, { useState, useEffect } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import Local from './helpers/Local';
import Api from './helpers/Api';
import NavBar from './components/NavBar';
import PrivateRoute from './components/PrivateRoute';
import LoginView from './views/LoginView';
import ErrorView from './views/ErrorView';
import OldPlansView from './views/OldPlansView';
import UsersView from './views/UsersView';
import Spoonacular from './views/Spoonacular';
import HomeView from './views/HomeView';
import ShoppingListView from './views/ShoppingListView';
import RecipesView from './views/RecipesView';
import WeekPlanView from './views/WeekPlanView';
import ProfileView from './views/ProfileView';
import RegisterView from './views/RegisterView';
//import AddPlanForm from './components/AddPlanForm';
import RecipesContext from "./components/RecipesContext";

const EMPTY_FORM = {
    API_id: 0,
    recipe_title: '',
    recipe_image: '',
    servings: 1,
    meal_type: '',
    week_day: '',
};

const EMPTY_PLAN = {
    plan_title: ''
  };

function App() {

    const [plans, setPlans] = useState([]);
    const [user, setUser] = useState(Local.getUser());
    const [loginErrorMsg, setLoginErrorMsg] = useState('');
    const [userPlans, setUserPlans] = useState([]);
    const navigate = useNavigate();
    const [planRecipes, setPlanRecipes] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [featRecipe, setFeatRecipe] = useState(null);
    const [ addedRecipe, setAddedRecipe ] = useState(EMPTY_FORM);
    const [featVisible, setfeatVisible] = useState(true);
    const [editingRecipeId, setEditingRecipeId] =useState(null);
    const [newPlan, setNewPlan] = useState(EMPTY_PLAN);
    const [editingPlan, setEditingPlan] = useState(null);
    const [warning, setWarning] = useState([]);
    const [addedItems, setAddedItems] = useState([]);
    let [newList] = useState([]);

    let recipesObject = { newList, addedItems, setAddedItems, warning, setWarning, user, editingPlan, setEditingPlan, userPlans, setUserPlans, getUserPlans, newPlan, setNewPlan, recipes, setRecipes, setPlans, editingRecipeId, setEditingRecipeId, featVisible, setfeatVisible, setFeatRecipe, showFeatRecipe, setAddedRecipe, planRecipes, updatePlanRecipes:(planRecipes) => setPlanRecipes(planRecipes), addedRecipe, featRecipe };

    useEffect(() => {
        getUserPlans();
      }, []);

    //FUNCTION TO CLICK ON RECIPE, VISUALIZE RECIPE ON TOP & ADD RECIPE'S DATA TO addedRecipe
    function showFeatRecipe(id){
        let selectedRecipe = recipes.find(r => r.id === id);
        setFeatRecipe(selectedRecipe);
        // let ingredients = selectedRecipe.extendedIngredients;
        // let ingredientList = []
        // console.log(ingredients);
        // console.log(ingredients[0].name);
        // for(let i=0; i<= ingredients.length; i++){
        //     // console.log(ingredients[i].name)
        //     ingredientList += ingredients[i].name;
        //     // console.log(ingredientList);
        // }
        // console.log(ingredientList);
        setAddedRecipe((addedRecipe) => ({...addedRecipe, API_id: selectedRecipe.id, recipe_title: selectedRecipe.title, recipe_image: selectedRecipe.image}));
    };
    
    async function doLogin(username, password) {
        let myresponse = await Api.loginUser(username, password);
        if (myresponse.ok) {
            console.log(myresponse);
            Local.saveUserInfo(myresponse.data.token, myresponse.data.user);
            setUser(myresponse.data.user);
            setLoginErrorMsg('');
            navigate('/');
        } else {
            setLoginErrorMsg('Login failed');
        }
    }

    function doLogout() {
        Local.removeUserInfo();
        setUser(null);
    }
 
      // Get All plans of the user
      async function getUserPlans() {
      
        try {
          let response = await Api._doFetch(`/api/plans/${user.id}`);
          if (response.ok) {
              let plans = response.data;
              setUserPlans(plans);
              console.log(plans);
          } else {
              console.log(`Server error: ${response.status} ${response.statusText}`);
          }
      } catch (err) {
          console.log(`Server error: ${err.message}`);
      }
      }
    

    return (
        <div className="App">
        
            <NavBar user={user} logoutCb={doLogout} />
            
            <div>
            <RecipesContext.Provider value={recipesObject}>
                <Routes>
                    <Route path="/"element={<HomeView userPlans={userPlans} plans={plans} setPlans={setPlans} user={user}/>} />
                    <Route path="/users" element={<UsersView />} />
                    <Route path="/users/:userId" element={
                        <PrivateRoute>
                            <ProfileView />
                        </PrivateRoute>
                    } />

                    <Route path="/plans/:userId" element={
                        <PrivateRoute>
                            <OldPlansView plans={plans}/>
                        </PrivateRoute>
                    } />

                    <Route path="/login" element={
                        <LoginView 
                            loginCb={(u, p) => doLogin(u, p)} 
                            loginError={loginErrorMsg} 
                            setUserPlans={setUserPlans}
                            userPlans={userPlans}
                        />
                    } />

                    <Route path="/register" element={
                        <RegisterView />
                    } />

                    <Route path="/spoon" element={<Spoonacular /> } />
                    <Route path="/recipes/:planId" element={<RecipesView /> } />              
                    <Route path="/shoppinglist/:planId" element={
                    <PrivateRoute>
                            <ShoppingListView/>
                        </PrivateRoute>  } />  
                       
                    <Route path="/weekPlan/:planId" element={<WeekPlanView /> } />
                
                    <Route path="*" element={<ErrorView code="404" text="Page not found" />} />
                </Routes>
                </RecipesContext.Provider>
            </div>
           
           
        </div>
    );
}

export default App;
