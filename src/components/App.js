import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {api} from "../utils/api.js";
import * as auth from "../utils/auth.js";
import Header from "./Header.js";
import Main from "./Main.js";
import Footer from "./Footer.js";
import ImagePopup from "./ImagePopup.js";
import EditProfilePopup from "./EditProfilePopup.js";
import EditAvatarPopup from "./EditAvatarPopup.js";
import AddPlacePopup from "./AddPlacePopup.js";
import { CurrentUserContext } from '../contexts/CurrentUserContext.js';
import Login from "./Login.js";
import Register from "./Register.js";
import ProtectedRoute from "./ProtectedRoute.js";
import InfoTooltip from './InfoTooltip.js';
import resolve from '../images/success.svg';
import reject from '../images/fail.svg';

const defaultSelectedCard = { name: '', link: '' };

function App() {
  const navigate = useNavigate();
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState(defaultSelectedCard);
  const [currentUser, setCurrentUser] = React.useState({});
  const [cards, setCards] = React.useState([]);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [emailName, setEmailName] = React.useState(null);
  const [popupImage, setPopupImage] = React.useState('');
  const [popupTitle, setPopupTitle] = React.useState('');
  const [infoTooltip, setInfoTooltip] = React.useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = React.useState(false);

  /* Регистрация */
  function onRegister(email, password) {
    auth.registerUser(email, password).then(() => {
      setPopupImage(resolve);
      setPopupTitle("Вы успешно зарегистрировались!");
      navigate("/sign-in");
    }).catch(() => {
      setPopupImage(reject);
      setPopupTitle("Что-то пошло не так! Попробуйте ещё раз.");
    }).finally(handleInfoTooltip);
  }

  /* Вход */
  function onLogin(email, password) {
    auth.loginUser(email, password).then((res) => {
      localStorage.setItem('jwt', res.token);
      setIsLoggedIn(true);
      setEmailName(email);
      navigate("/");
    }).catch(() => {
      setPopupImage(reject);
      setPopupTitle("Что-то пошло не так! Попробуйте ещё раз.");
      handleInfoTooltip();
    })
  }

  /* Сохранить токен в локальном хранилище, установить имейл */
  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      auth.getToken(jwt).then((res) => {
        if (res) {
          setIsLoggedIn(true);
          setEmailName(res.data.email);
        }
      }).catch((err) => {
        console.error(err);
      })
    }
  }, []);
  
  useEffect(() => {
    if (isLoggedIn === true) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);
  
  /* Одновременное получение данных пользователя и карточек */
  useEffect(() => { 
    Promise.all([api.getUserData(), api.getInitialCards()])
      .then((res) => {
        setCurrentUser(res[0]);
        setCards(res[1]);
      })
      .catch((err) => {
        console.error(err);
      });
    }, []);

  function handleEditProfileClick(){
    setIsEditProfilePopupOpen(true);
  }
  function handleAddPlaceClick(){
    setIsAddPlacePopupOpen(true);
  }
  function handleEditAvatarClick(){
    setIsEditAvatarPopupOpen(true);
  }
  function handleCardClick(card){
    setSelectedCard(card);
    setIsImagePopupOpen(true);
  }
  function handleInfoTooltip(){
    setInfoTooltip(true);
  }

  function onSignOut() {
    setIsLoggedIn(false);
    setEmailName(null);
    navigate("/sign-in");
    localStorage.removeItem("jwt");//удаление токена из локального хранилища
  }

  /* Ставим и убираем лайк на карточке */
  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);// Снова проверяем, есть ли уже лайк на этой карточке
    
    const action = !isLiked ? api.putLike(card._id) : api.deleteLike(card._id);
    action
      .then((newCard) => {
        setCards((state) => 
        state.map((c) => c._id === card._id ? newCard : c))
      }).catch((err) => {
        console.error(err)
      });    
  }

  /* Удаляет карточку */
  function handleCardDelete(card) {
    api.deleteCard(card._id)
      .then (() => {
        setCards(items => items.filter((i) => i._id !== card._id));
      }).catch((err) => {
        console.error(err);
      })
  }

  /* Обновляет данные пользователя */
  function handleUpdateUser(data) {
    api.patchUserInfo(data)
      .then(newUser => {
        setCurrentUser(newUser);
        closeAllPopups();
      }).catch((err) => {
        console.error(err);
      })
  }

  /* Обновляет аватар */
  function handleAvatarUpdate(data) {
    api.patchUserAvatar(data)
      .then(newAvatar => {
        setCurrentUser(newAvatar);
        closeAllPopups();
      }).catch((err) => {
        console.error(err);
      })
  }

  /* Добавляет карточку */
  function handleAddPlaceSubmit(card) {
    api.postCard(card)
    .then(data => {
      setCards([data, ...cards]);
      closeAllPopups();
    }).catch((err) => {
      console.error(err);
    })
  }

  /* Закрытие всех попапов */
  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setSelectedCard(defaultSelectedCard);
    setInfoTooltip(false);
    setIsImagePopupOpen(false);
  }
  
  return (
    <CurrentUserContext.Provider value={currentUser}>
    <div className="page">
      <Routes>
        <Route path="/sign-in" element={
          <>
            <Header title="Регистрация" route="/sign-up" />
            <Login onLogin={onLogin} />
          </>
        }/>
        <Route path="/sign-up" element={
          <>
            <Header title="Войти" route="/sign-in" />
            <Register onRegister={onRegister} />
          </>
        }/>

        <Route exact path="/" element={
          <>
            <Header title="Выйти" mail={emailName} onClick={onSignOut} route="" />
            <ProtectedRoute
              component={Main}
              isLogged={isLoggedIn}
              onCardClick={handleCardClick}
              onEditProfile={handleEditProfileClick}
              onAddPlace={handleAddPlaceClick}
              onEditAvatar={handleEditAvatarClick}
              onCardLike={handleCardLike}
              onCardDelete={handleCardDelete}
              cards={cards}
            />
            <Footer />
          </>
        }/>
        <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/sign-in"} />} />
      </Routes>
      <EditProfilePopup
        isOpen={isEditProfilePopupOpen}
        onClose={closeAllPopups}
        onUpdateUser={handleUpdateUser}
      />
      <AddPlacePopup
        isOpen={isAddPlacePopupOpen}
        onClose={closeAllPopups}
        onAddNewPlace={handleAddPlaceSubmit}
      />      
      <EditAvatarPopup
        isOpen={isEditAvatarPopupOpen}
        onClose={closeAllPopups}
        onUpdateAvatar={handleAvatarUpdate}
      />      
      <ImagePopup
        card={selectedCard}
        onClose={closeAllPopups}
        isOpen={isImagePopupOpen}
      />
      <InfoTooltip
        image={popupImage}
        title={popupTitle}
        isOpen={infoTooltip}
        onClose={closeAllPopups}
      />
    </div>
    </CurrentUserContext.Provider>
  );
}

export default App;