import * as ko from 'knockout';

interface Item {
    name: KnockoutObservable<string>;
    parent: Category;
}

interface Category {
    name: KnockoutObservable<string>;
    items: KnockoutObservableArray<Item>;
    isVisible: KnockoutObservable<boolean>;
}

class AppViewModel {
    // categories: KnockoutObservableArrayFunctions;
    categories: KnockoutObservableArray<Category | KnockoutArrayChange<Category>> | any;
    searchInput: KnockoutObservable<string>;
    draggedItem: Item | Category | null;

    constructor() {
        this.categories = ko.observableArray(/* массив категорий с элементами */);
        this.searchInput = ko.observable('');
        this.draggedItem = null;
    }

    toggleCategory(category: Category) {
        category.isVisible(!category.isVisible());
    }

    // ... остальные методы и обработчики событий

    resetSearch() {
        this.searchInput('');
    }
}

// Запуск приложения
ko.applyBindings(new AppViewModel());