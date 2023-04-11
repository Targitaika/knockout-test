import * as ko from 'knockout';

class Item {
    name: ko.Observable<string>;
    parent: Category;
    isEditing: ko.Observable<boolean>;
    isDraggable: ko.Observable<boolean>;

    constructor(name: string, parent: Category) {
        this.name = ko.observable(name);
        this.parent = parent;
        this.isEditing = ko.observable(false);
        this.isDraggable = ko.observable(true);
    }
}

class Category {
    name: ko.Observable<string>;
    items: ko.ObservableArray<Item>;
    isVisible: ko.Observable<boolean>;
    isEditing: ko.Observable<boolean>;
    isDraggable: ko.Observable<boolean>;
    parent: any;

    constructor(name: string) {
        this.name = ko.observable(name);
        this.items = ko.observableArray<Item>([]);
        this.isVisible = ko.observable(true);
        this.isEditing = ko.observable(false);
        this.isDraggable = ko.observable(true);
        this.parent = []
    }
}

class AppViewModel {
    categories: ko.ObservableArray<Category>;
    draggedItem: Item | Category | null;

    constructor() {
        const tempCategory1 = new Category('Category 1');
        const tempCategory2 = new Category('Category 2');

        tempCategory1.items.push(new Item('Item 1.1', tempCategory1));
        tempCategory1.items.push(new Item('Item 1.2', tempCategory1));

        tempCategory2.items.push(new Item('Item 2.1', tempCategory2));
        tempCategory2.items.push(new Item('Item 2.2', tempCategory2));

        this.categories = ko.observableArray([tempCategory1, tempCategory2]);
        this.draggedItem = null;
    }

    startDragging(item: Item | Category, event: DragEvent, ...arg:any) {
        console.log('startDragging', event, arg)
        event.dataTransfer!.setData('application/json', JSON.stringify(item));
        event.dataTransfer!.effectAllowed = 'move';

        this.draggedItem = item;
    }

    allowDrop(item: Item | Category, event: DragEvent) {
        console.log('allowDrop')

        event.preventDefault();
        event.dataTransfer!.dropEffect = 'move';
    }

    drop(target: Item | Category, event: DragEvent, ...arg: any) {
        console.log('drop', event, arg);
        event.preventDefault();

        if (this.draggedItem === target) {
            return;
        }

        const isDraggedCategory = this.draggedItem instanceof Category;
        const isTargetCategory = target instanceof Category;

        if (isDraggedCategory && !isTargetCategory) {
            return;
        }

        let targetIndex;
        let draggedIndex;

        if (isTargetCategory) {
            targetIndex = this.categories().indexOf(target as Category);
            draggedIndex = isDraggedCategory
                ? this.categories().indexOf(this.draggedItem as Category)
                : this.draggedItem!.parent.items().indexOf(this.draggedItem as Item);
        } else {
            targetIndex = target.parent.items().indexOf(target);
            draggedIndex = this.draggedItem!.parent.items().indexOf(this.draggedItem);
        }

        if (draggedIndex > -1) {
            if (isDraggedCategory) {
                this.categories.splice(draggedIndex, 1);
            } else {
                this.draggedItem!.parent.items.splice(draggedIndex, 1);
            }
        }

        if (isTargetCategory) {
            if (isDraggedCategory) {
                this.categories.splice(targetIndex, 0, this.draggedItem as Category);
            } else {
                (target as Category).items.push(this.draggedItem as Item);
                this.draggedItem!.parent = target as Category;
            }
        } else {
            target.parent.items.splice(targetIndex, 0, this.draggedItem as Item);
            this.draggedItem!.parent = target.parent;
        }

        this.draggedItem = null;
    }

    changeContent(item: Item | Category, _: any, event: MouseEvent) {
        event.stopPropagation();
        item.isEditing(!item.isEditing());
    }

    deleteCategory(category: Category, _: any, event: MouseEvent) {
        console.log(event);
        event.stopPropagation();
        if (category.items().length === 0) {
            this.categories.remove(category);
        }
    }

    // @ts-ignore
    deleteItem(item: Item, _: any, event: MouseEvent) {
        event.stopPropagation();
        item.parent.items.remove(item);
    }

    toggleDraggable(item: Item | Category, _: any, event: MouseEvent) {
        event.stopPropagation();
        item.isDraggable(!item.isDraggable());
    }
}

ko.applyBindings(new AppViewModel());
