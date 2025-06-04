const cards = document.querySelectorAll('.interestCard');
let selectedCards = [];

cards.forEach(card => {
    card.addEventListener('click', () => {
        const cardId = card.id;

        if (selectedCards.includes(cardId)) {
            selectedCards = selectedCards.filter(id => id !== cardId);
            card.classList.remove('selected');
        } else {
            selectedCards.push(cardId);
            card.classList.add('selected');
        }
    });
});
