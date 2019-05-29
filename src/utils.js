export const splitArrayToChunks = (arr, size = 25) => {
    const myArray = [];
    for(let i = 0; i < arr.length; i += size) {
        myArray.push(arr.slice(i, i+size));
    }
    return myArray;
};
