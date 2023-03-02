declare module 'multi-download' {
  export default function multiDownload(
    urls: string[],
    options?: {
      rename?: ({}: { url: string, index: number, urls: string[]}) => string
    }
  ): Promise<void>
}