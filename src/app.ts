import * as ko from 'knockout';
// @ts-ignore
import {Sortable, SortableEvent} from 'sortablejs';

class Item {
    name: ko.Observable<string>;
    parentId: number;
    isEditing: ko.Observable<boolean>;
    isDraggable: ko.Observable<boolean>;
    id: number;
    static lastId = 0;

    constructor(name: string, parentId: number) {
        this.name = ko.observable(name);
        this.parentId = parentId;
        this.isEditing = ko.observable(false);
        this.isDraggable = ko.observable(true);
        this.id = ++Item.lastId;
    }
}

class Category {
    name: ko.Observable<string>;
    items: ko.ObservableArray<Item>;
    isVisible: ko.Observable<boolean>;
    isEditing: ko.Observable<boolean>;
    isDraggable: ko.Observable<boolean>;
    isCollapsed: ko.Observable<boolean>;
    parent: any;
    id: number;

    constructor(name: string, id: number) {
        this.name = ko.observable(name);
        this.items = ko.observableArray<Item>([]);
        this.isVisible = ko.observable(true);
        this.isEditing = ko.observable(false);
        this.isDraggable = ko.observable(true);
        this.isCollapsed = ko.observable(false);
        this.parent = [];
        this.id = id;
    }
}

class AppViewModel {
    categories: ko.ObservableArray<Category>;
    draggedItem: Item | Category | null;
    uncategorizedItems: ko.ObservableArray<Item>;
    searchQuery: ko.Observable<string>;


    constructor() {
        const tempCategory1 = new Category('Обязательные для всех', 1);
        const tempCategory2 = new Category('Обязательные для трудоустройства', 2);
        const tempCategory3 = new Category('Специальные', 3);
        const uncategorizedItems = new Category('UncategorizedItems', 4);

        tempCategory1.items.push(new Item('Паспорт', tempCategory1.id));
        tempCategory1.items.push(new Item('ИНН', tempCategory1.id));

        tempCategory2.items.push(new Item('Item 2.1', tempCategory2.id));

        this.uncategorizedItems = ko.observableArray([
            new Item("Тестовое задание кандидата", uncategorizedItems.id),
            new Item("Трудовой договор", uncategorizedItems.id),
            new Item("Мед. книжка", uncategorizedItems.id),
        ]);

        this.categories = ko.observableArray([tempCategory1, tempCategory2, tempCategory3]);

        this.draggedItem = null;
        this.searchQuery = ko.observable('');
    }

    allowDrop = (item: Item | Category, event: DragEvent) => {
        console.log('allowDrop')

        event.preventDefault();
        event.dataTransfer!.dropEffect = 'move';

    }

    changeContent = (item: Item | Category, event: MouseEvent) => {
        event.stopPropagation();
        item.isEditing(!item.isEditing());
    }

    deleteCategory = (category: Category, event: MouseEvent) => {
        console.log(category);
        console.log('categories', this.categories)
        event.stopPropagation();
        if (category.items().length === 0) {
            this.categories.remove(category);
        }
    }

    deleteItem = (item: Item, event: MouseEvent) => {
        console.log('deleteItem', item, event)
        event.stopPropagation();
        if (item.parentId === 0) {
            this.uncategorizedItems.remove(item);
        } else {
            this.findCategoryById(item.parentId)!.items.remove(item);
        }
    }

    toggleDraggable = (item: Item | Category, event: MouseEvent) => {
        console.log('toggleDraggable', item, event);
        event.stopPropagation();
        item.isDraggable(!item.isDraggable());
    }

    isMatch = (item: Item | Category): boolean => {
        const searchText = this.searchQuery().toLowerCase();
        return item.name().toLowerCase().includes(searchText) || item instanceof Category && item.items().some(i => i.name().toLowerCase().includes(searchText));
    }

    findCategoryById(id: number): Category | undefined {
        return this.categories().find(category => category.id === id);
    }

    findItemById(id: number): Item | undefined {
        const allItems = this.categories()
            .map(category => category.items())
            .flat()
            .concat(this.uncategorizedItems());

        return allItems.find(item => item.id === id);
    }

    moveItemBetweenCategories(item: Item, fromCategoryId: number, toCategoryId: number) {
        // Удаление элемента из старой категории или из списка uncategorizedItems
        const fromCategoryItems = fromCategoryId === 0 ? this.uncategorizedItems : this.findCategoryById(fromCategoryId)?.items;
        const toCategoryItems = toCategoryId === 0 ? this.uncategorizedItems : this.findCategoryById(toCategoryId)?.items;

        if (fromCategoryItems && toCategoryItems) {

            // Обновление parentId у перемещенного элемента
            item.parentId = toCategoryId;
        }
    }

    initializeItemsSortable = () => {
        const categories = document.querySelectorAll(".category .items, .uncategorizedItems");
        categories.forEach((element) => {
            new Sortable(element, {
                group: "items",
                animation: 150,
                filter: ".js-remove, .js-ignore",
                onEnd: (event: SortableEvent) => {
                    const fromCategoryId = parseInt(event.from.parentElement!.dataset.categoryId);
                    const toCategoryId = parseInt(event.to.parentElement!.dataset.categoryId);
                    const draggedItem = this.findItemById(parseInt(event.item.dataset.id));

                    if (draggedItem) {
                        if (fromCategoryId !== toCategoryId) {
                            this.moveItemBetweenCategories(draggedItem, fromCategoryId, toCategoryId);
                        }
                    }
                },
            });
        });
    };

    initializeCategoriesSortable = () => {
        console.log('initializeCategoriesSortable')
        new Sortable(document.querySelector('.categories')!, {
            group: 'categories',
            animation: 150,
            filter: '.js-remove, .js-ignore',
            onEnd: (event: SortableEvent) => {
                const newIndex = event.newIndex;
                const oldIndex = event.oldIndex;
                const draggedCategory = this.findCategoryById(parseInt(event.item.dataset.id));

                if (draggedCategory) {
                    this.categories.splice(oldIndex, 1);
                    this.categories.splice(newIndex, 0, draggedCategory);
                }
            },
        });
    };

    initSortable() {
        this.initializeCategoriesSortable();
        this.initializeItemsSortable();
    }

}

const appViewModel = new AppViewModel();
ko.applyBindings(appViewModel);
appViewModel.initSortable();