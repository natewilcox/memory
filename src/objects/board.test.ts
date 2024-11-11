import { Board } from "./board";

test('layout has 2 of each element', () => {
 
    const layout = Board.generateLayout(24);
    expect(layout.length).toBe(24);

    const board = new Board(layout);
    const map = new Map<number, number>();

    for(const i of layout) {
        
        if(!map.has(i)) {
            map.set(i, 1);
        }
        else if(map.get(i) === 1) {
            map.set(i, map.get(i)! + 1);
        }
    }

    expect(map.size).toBe(12);
});
