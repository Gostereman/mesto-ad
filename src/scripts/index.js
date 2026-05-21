import "../pages/index.css";
import { createCard } from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setupModalOverlayClose,
} from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  updateAvatar,
  addCard,
  deleteCard,
  changeLikeCardStatus,
} from "./components/api.js";

// ---- Конфигурация валидации ----
const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// ---- DOM: профиль ----
const profileName = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");
const cardsContainer = document.querySelector(".places__list");

// ---- DOM: попап редактирования профиля ----
const profileEditButton = document.querySelector(".profile__edit-button");
const profileFormModal = document.querySelector(".popup_type_edit-avatar");
const profileForm = profileFormModal.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(
  ".popup__input_type_name"
);
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);

// ---- DOM: попап добавления карточки ----
const addCardButton = document.querySelector(".profile__add-button");
const addCardModal = document.querySelector(".popup_type_new-card");
const addCardForm = addCardModal.querySelector(".popup__form");
const cardNameInput = addCardForm.querySelector(
  ".popup__input_type_card-name"
);
const cardLinkInput = addCardForm.querySelector(".popup__input_type_url");

// ---- DOM: попап просмотра изображения ----
const cardImageModal = document.querySelector(".popup_type_image");
const cardModalImage = cardImageModal.querySelector(".popup__image");
const cardModalCaption = cardImageModal.querySelector(".popup__caption");

// ---- DOM: попап обновления аватара ----
const avatarContainer = document.querySelector(".profile__image-container");
const avatarModal = document.querySelector(".popup_type_avatar");
const avatarForm = avatarModal.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");

// ---- DOM: попап удаления карточки (опционально) ----
const deleteCardModal = document.querySelector(".popup_type_remove-card");
const deleteCardForm = deleteCardModal?.querySelector(".popup__form");

// ---- Состояние ----
let currentUserId = null;
let cardToDelete = null;
let cardElementToDelete = null;

// ---- Утилита: переключение текста кнопки ----
const setButtonLoadingState = (button, isLoading, loadingText, defaultText) => {
  button.textContent = isLoading ? loadingText : defaultText;
};

// ---- Обработчики карточек ----
const handleCardImageClick = (cardData) => {
  cardModalImage.src = cardData.link;
  cardModalImage.alt = cardData.name;
  cardModalCaption.textContent = cardData.name;
  openModalWindow(cardImageModal);
};

const handleLikeCard = (cardId, likeButton, likeCountElement) => {
  const isLiked = likeButton.classList.contains(
    "card__like-button_is-active"
  );
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle("card__like-button_is-active");
      likeCountElement.textContent = updatedCard.likes.length;
    })
    .catch((err) => console.log(err));
};

const handleDeleteCard = (cardId, cardElement) => {
  if (deleteCardModal) {
    cardToDelete = cardId;
    cardElementToDelete = cardElement;
    openModalWindow(deleteCardModal);
  } else {
    deleteCard(cardId)
      .then(() => cardElement.remove())
      .catch((err) => console.log(err));
  }
};

// ---- Обработчики форм ----
const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = profileForm.querySelector(".popup__button");
  setButtonLoadingState(submitButton, true, "Сохранение...", "Сохранить");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileName.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModal);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      setButtonLoadingState(submitButton, false, "Сохранение...", "Сохранить");
    });
};

const handleAddCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = addCardForm.querySelector(".popup__button");
  setButtonLoadingState(submitButton, true, "Создание...", "Создать");

  addCard({ name: cardNameInput.value, link: cardLinkInput.value })
    .then((newCard) => {
      const cardElement = createCard(
        newCard,
        currentUserId,
        handleDeleteCard,
        handleLikeCard,
        handleCardImageClick
      );
      cardsContainer.prepend(cardElement);
      addCardForm.reset();
      closeModalWindow(addCardModal);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      setButtonLoadingState(submitButton, false, "Создание...", "Создать");
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = avatarForm.querySelector(".popup__button");
  setButtonLoadingState(submitButton, true, "Сохранение...", "Сохранить");

  updateAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarModal);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      setButtonLoadingState(submitButton, false, "Сохранение...", "Сохранить");
    });
};

// ---- Обработчик удаления (с попапом подтверждения) ----
if (deleteCardForm) {
  deleteCardForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    const submitButton = deleteCardForm.querySelector(".popup__button");
    setButtonLoadingState(submitButton, true, "Удаление...", "Да");

    deleteCard(cardToDelete)
      .then(() => {
        cardElementToDelete.remove();
        closeModalWindow(deleteCardModal);
        cardToDelete = null;
        cardElementToDelete = null;
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setButtonLoadingState(submitButton, false, "Удаление...", "Да");
      });
  });
}

// ---- Открытие попапов ----
profileEditButton.addEventListener("click", () => {
  profileTitleInput.value = profileName.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profileFormModal);
});

addCardButton.addEventListener("click", () => {
  addCardForm.reset();
  clearValidation(addCardForm, validationConfig);
  openModalWindow(addCardModal);
});

avatarContainer.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarModal);
});

// ---- Отправка форм ----
profileForm.addEventListener("submit", handleProfileFormSubmit);
addCardForm.addEventListener("submit", handleAddCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

// ---- Закрытие попапов ----
document.querySelectorAll(".popup__close").forEach((button) => {
  button.addEventListener("click", () => {
    closeModalWindow(button.closest(".popup"));
  });
});

document.querySelectorAll(".popup").forEach(setupModalOverlayClose);

// ---- Включение валидации ----
enableValidation(validationConfig);

// ---- Загрузка данных с сервера ----
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;
    profileName.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      const cardElement = createCard(
        cardData,
        currentUserId,
        handleDeleteCard,
        handleLikeCard,
        handleCardImageClick
      );
      cardsContainer.append(cardElement);
    });
  })
  .catch((err) => console.log(err));