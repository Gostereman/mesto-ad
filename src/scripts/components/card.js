export const createCard = (
  cardData,
  userId,
  handleDeleteCard,
  handleLikeCard,
  handleCardImageClick
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

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likeCount.textContent = cardData.likes.length;

  // Кнопка удаления только для автора карточки
  if (cardData.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () => {
      handleDeleteCard(cardData._id, cardElement);
    });
  }

  // Начальное состояние лайка
  const isLiked = cardData.likes.some((like) => like._id === userId);
  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }

  likeButton.addEventListener("click", () => {
    handleLikeCard(cardData._id, likeButton, likeCount);
  });

  cardImage.addEventListener("click", () => {
    handleCardImageClick(cardData);
  });

  return cardElement;
};