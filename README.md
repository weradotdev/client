- https://dribbble.com/shots/26901934-Klip-Task-Mobile-App
- https://dribbble.com/shots/25167555-Task-and-Project-Management-Mobile-App

Bearer 9|hQLMfixbmjd20T73UjLZH5Sn8JnJwjytNPSl3K9ve0a0038f

const renderMessageText = useCallback(
		(props: { currentMessage?: IMessage }) => {
			const currentText = props.currentMessage?.text ?? "";
			const containsHtml = /<\/?[a-z][\s\S]*>/i.test(currentText);

			if (containsHtml) {
				return <HTMLView value={currentText} />;
			}

			return <HText size="base">{currentText}</HText>;
		},
		[],
	);