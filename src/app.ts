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

function createItem(name: string, parent: Category): Item {
    return {name: ko.observable(name), parent: parent};
}

class AppViewModel {
    categories: KnockoutObservableArray<Category>;
    searchInput: KnockoutObservable<string>;
    draggedItem: Item | Category | null;

    constructor() {
        const tempCategory1: Category = {
            name: ko.observable('Category 1'),
            items: ko.observableArray([]),
            isVisible: ko.observable(true),
        };

        const tempCategory2: Category = {
            name: ko.observable('Category 2'),
            items: ko.observableArray([]),
            isVisible: ko.observable(true),
        };

        tempCategory1.items.push(createItem('Item 1.1', tempCategory1));
        tempCategory1.items.push(createItem('Item 1.2', tempCategory1));

        tempCategory2.items.push(createItem('Item 2.1', tempCategory2));
        tempCategory2.items.push(createItem('Item 2.2', tempCategory2));

        this.categories = ko.observableArray([tempCategory1, tempCategory2]);
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