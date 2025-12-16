export type Paging = {
  page: number;
  size: number;
  total: number;
};

export type Pageable<T> = {
    data: Array<T>;
    paging: Paging;
}