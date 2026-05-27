import "../pages/index.css";
import {
  createCard,
  isButtonLiked,
  updateCardLikes,
  removeCard,
} from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setupModalOverlayClose,
} from "./components/modal.js";
import {
  enableValidation,
  clearValidation,
} from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  updateAvatar,
  addCard,
  deleteCard,
  changeLikeCardStatus,
} from "./components/api.js";

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const profileName = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");
const profileAvatarContainer = document.querySelector(
  ".profile__image-container"
);
const cardsContainer = document.querySelector(".places__list");

const profileEditButton = document.querySelector(".profile__edit-button");
const profileFormModal = document.querySelector(".popup_type_edit");
const profileForm = profileFormModal.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(
  ".popup__input_type_name"
);
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);

const addCardButton = document.querySelector(".profile__add-button");
const addCardModal = document.querySelector(".popup_type_new-card");
const addCardForm = addCardModal.querySelector(".popup__form");
const cardNameInput = addCardForm.querySelector(
  ".popup__input_type_card-name"
);
const cardLinkInput = addCardForm.querySelector(".popup__input_type_url");

const cardImageModal = document.querySelector(".popup_type_image");
const cardModalImage = cardImageModal.querySelector(".popup__image");
const cardModalCaption = cardImageModal.querySelector(".popup__caption");

const avatarModal = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarModal.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");

const deleteCardModal = document.querySelector(".popup_type_remove-card");
const deleteCardForm = deleteCardModal.querySelector(".popup__form");

const cardInfoModal = document.querySelector(".popup_type_info");
const infoTitle = cardInfoModal.querySelector(".popup__title");
const infoList = cardInfoModal.querySelector(".popup__info");
const infoText = cardInfoModal.querySelector(".popup__text");
const userList = cardInfoModal.querySelector(".popup__list");
const definitionTemplate = document.querySelector(
  "#popup-info-definition-template"
);
const userBadgeTemplate = document.querySelector(
  "#popup-info-user-preview-template"
);

let currentUserId = null;
let cardToDelete = null;
let cardElementToDelete = null;

const setButtonLoadingState = (
  button,
  isLoading,
  loadingText,
  defaultText
) => {
  button.textContent = isLoading ? loadingText : defaultText;
};

const handleCardImageClick = (cardData) => {
  cardModalImage.src = cardData.link;
  cardModalImage.alt = cardData.name;
  cardModalCaption.textContent = cardData.name;
  openModalWindow(cardImageModal);
};

const handleCardInfoClick = (cardData) => {
  infoTitle.textContent = cardData.name;

  infoList.replaceChildren();
  userList.replaceChildren();

  const addInfoItem = (term, description) => {
    const item = definitionTemplate.content.cloneNode(true);
    item.querySelector(".popup__info-term").textContent = term;
    item.querySelector(".popup__info-description").textContent = description;
    infoList.append(item);
  };

  addInfoItem("Автор", cardData.owner.name);
  addInfoItem(
    "Дата добавления",
    new Date(cardData.createdAt).toLocaleDateString("ru-RU")
  );

  infoText.textContent = `Лайков: ${cardData.likes.length}`;

  cardData.likes.forEach((user) => {
    const badge = userBadgeTemplate.content.cloneNode(true);
    badge.querySelector(".popup__list-item").textContent = user.name;
    userList.append(badge);
  });

  openModalWindow(cardInfoModal);
};

const handleLikeCard = (cardId, likeButton, likeCountElement) => {
  const liked = isButtonLiked(likeButton);
  changeLikeCardStatus(cardId, liked)
    .then((updatedCard) => {
      updateCardLikes(
        likeButton,
        likeCountElement,
        updatedCard.likes,
        currentUserId
      );
    })
    .catch((err) => console.log(err));
};

const handleDeleteCard = (cardId, cardElement) => {
  cardToDelete = cardId;
  cardElementToDelete = cardElement;
  openModalWindow(deleteCardModal);
};

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
      setButtonLoadingState(
        submitButton,
        false,
        "Сохранение...",
        "Сохранить"
      );
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
        handleCardImageClick,
        handleCardInfoClick
      );
      cardsContainer.prepend(cardElement);
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
      setButtonLoadingState(
        submitButton,
        false,
        "Сохранение...",
        "Сохранить"
      );
    });
};

const handleDeleteCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = deleteCardForm.querySelector(".popup__button");
  setButtonLoadingState(submitButton, true, "Удаление...", "Да");

  deleteCard(cardToDelete)
    .then(() => {
      removeCard(cardElementToDelete);
      closeModalWindow(deleteCardModal);
      cardToDelete = null;
      cardElementToDelete = null;
    })
    .catch((err) => console.log(err))
    .finally(() => {
      setButtonLoadingState(submitButton, false, "Удаление...", "Да");
    });
};

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

profileAvatarContainer.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarModal);
});

document.querySelectorAll(".popup__close").forEach((button) => {
  button.addEventListener("click", () => {
    closeModalWindow(button.closest(".popup"));
  });
});

document.querySelectorAll(".popup").forEach(setupModalOverlayClose);

profileForm.addEventListener("submit", handleProfileFormSubmit);
addCardForm.addEventListener("submit", handleAddCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
deleteCardForm.addEventListener("submit", handleDeleteCardFormSubmit);

enableValidation(validationConfig);

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
        handleCardImageClick,
        handleCardInfoClick
      );
      cardsContainer.append(cardElement);
    });
  })
  .catch((err) => console.log(err));