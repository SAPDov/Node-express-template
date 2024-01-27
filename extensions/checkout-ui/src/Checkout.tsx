import {
	Banner,
	useApi,
	useTranslate,
	reactExtension,
	BlockStack,
	Choice,
	ChoiceList,
	InlineStack,
	useCartLines,
	Button,
	Text,
} from '@shopify/ui-extensions-react/checkout';
import { useState } from 'react';

export default reactExtension('purchase.checkout.block.render', () => <Extension />);

function Extension() {
	const translate = useTranslate();
	const { extension, checkoutToken } = useApi();

	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);
	const lines = useCartLines();
	const url = extension.scriptUrl.replace(/^https?:\/\/([^/]+).*$/, '$1');

	const handleSaveForLaterButtonClick = async () => {
		try {
			const response = await fetch(`https://${url}/api/checkouts/save-cart`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ checkoutToken: checkoutToken.current, selectedIds }),
			});

			if (!response.ok) {
				console.error('Failed to save cart for later:', response.statusText);
				return;
			}
			setSelectedIds([]); // Clear selectedIds arrayß
			setShowSuccessMessage(true);
			const responseData = await response.json();
			console.log('Data posted successfully:', responseData);
		} catch (error) {
			console.error('Error posting data to Shopify:', error);
		}
	};

	const handleChoiceListChange = (selectedValues: string[]) => {
		setSelectedIds(selectedValues);
		setShowSuccessMessage(false);
	};

	return (
		<Banner title="save-for-later">
			<InlineStack>
				<ChoiceList name="choiceMultiple" value={selectedIds} onChange={handleChoiceListChange}>
					<BlockStack>
						{lines?.map((line) => (
							<Choice id={line.id} key={line.id}>
								{line?.merchandise?.title}
							</Choice>
						))}
					</BlockStack>
				</ChoiceList>
			</InlineStack>
			{showSuccessMessage && <Text>Cart was updated successfully</Text>}

			<Button onPress={handleSaveForLaterButtonClick}>Save</Button>
		</Banner>
	);
}
