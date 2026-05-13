declare module "usbabynames" {
  export function getDetailed(
    name: string,
    sex: string,
  ): Promise<{
    id?: number;
    name?: string;
    sex?: string;
    nameData?: string;
  }>;
}
