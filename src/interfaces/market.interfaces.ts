
export interface IMarket {
    hashkey: string; // this way we can avoid duplicates
    items: Array<string>;
    enabled: boolean;
}

