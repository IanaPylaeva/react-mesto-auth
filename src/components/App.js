import React, { useEffect } from "react";
import {api} from "../utils/api.js";
import Header from "./Header.js";
import Main from "./Main.js";
import Footer from "./Footer.js";
import ImagePopup from "./ImagePopup.js";
import EditProfilePopup from "./EditProfilePopup.js";
import EditAvatarPopup from "./EditAvatarPopup.js";
import AddPlacePopup from "./AddPlacePopup.js";
import { CurrentUserContext } from '../contexts/CurrentUserContext.js';

const defaultSelectedCard = { name: '', link: '' };

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState(defaultSelectedCard);
  const [currentUser, setCurrentUser] = React.useState({});
  const [cards, setCards] = React.useState([]);

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
  }
  
  return (
    <CurrentUserContext.Provider value={currentUser}>
    <div className="page">
      <Header />
      <Main 
        onCardClick={handleCardClick}
        onEditProfile={handleEditProfileClick}
        onAddPlace={handleAddPlaceClick}
        onEditAvatar={handleEditAvatarClick}
        onCardLike={handleCardLike}
        onCardDelete={handleCardDelete}
        cards={cards}
      />
      <Footer />
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
      />
    </div>
    </CurrentUserContext.Provider>
  );
}

export default App;