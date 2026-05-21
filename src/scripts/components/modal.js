const handleEscapeKey = (evt) => {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".popup_is-opened");
    if (openedModal) {
      closeModalWindow(openedModal);
    }
  }
};

export const openModalWindow = (modalWindow) => {
  modalWindow.classList.add("popup_is-opened");
  document.addEventListener("keydown", handleEscapeKey);
};

export const closeModalWindow = (modalWindow) => {
  modalWindow.classList.remove("popup_is-opened");
  document.removeEventListener("keydown", handleEscapeKey);
};

export const setupModalOverlayClose = (modalWindow) => {
  modalWindow.addEventListener("click", (evt) => {
    if (evt.target === modalWindow) {
      closeModalWindow(modalWindow);
    }
  });
};