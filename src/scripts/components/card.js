export const isButtonLiked = (likeButton) => {
  return likeButton.classList.contains("card__like-button_is-active");
};

export const updateCardLikes = (
  likeButton,
  likeCountElement,
  likes,
  userId
) => {
  const liked = likes.some((like) => like._id === userId);
  likeButton.classList.toggle("card__like-button_is-active", liked);
  likeCountElement.textContent = likes.length;
};

export const removeCard = (cardElement) => {
  cardElement.remove();
};

export const createCard = (
  cardData,
  userId,
  handleDeleteCard,
  handleLikeCard,
  handleCardImageClick,
  handleCardInfoClick
) => {
  const cardTemplate = document.querySelector("#card-template");
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const deleteButton = cardElement.querySelector(".card__delete-button");
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");
  const infoButton = cardElement.querySelector(
    ".card__control-button_type_info"
  );

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likeCount.textContent = cardData.likes.length;

  if (cardData.likes.some((like) => like._id === userId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (cardData.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () => {
      handleDeleteCard(cardData._id, cardElement);
    });
  }

  likeButton.addEventListener("click", () => {
    handleLikeCard(cardData._id, likeButton, likeCount);
  });

  cardImage.addEventListener("click", () => {
    handleCardImageClick(cardData);
  });

  infoButton.addEventListener("click", () => {
    handleCardInfoClick(cardData);
  });

  return cardElement;
};