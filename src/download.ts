
const delay = (milliseconds: number) => new Promise(resolve => {
	setTimeout(resolve, milliseconds);
});

const download = async (url:string, name:string) => {
	const a = document.createElement('a');
	a.download = name;
	a.href = url;
	a.style.display = 'none';
	document.body.append(a);
	a.click();

	// Chrome requires the timeout
	await delay(100);
	a.remove();
};

const multiDownload = async (urls: string[],
    options?: {
      rename?: ({}: { url: string, index: number, urls: string[]}) => string
    }) => {
		
		const { rename } = options || {};
		for (const [index, url] of urls.entries()) {
			const name = typeof rename === 'function' ? rename({url, index, urls}) : '';
			const isLastDownload = index === (urls.length - 1);
			const delayTime = 1000;
			
			await delay(delayTime)
			download(url, name);
			!isLastDownload && await delay(delayTime * 1.5);
		}
	}


export default multiDownload;