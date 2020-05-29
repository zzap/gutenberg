/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useCallback } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { cleanForSlug } from '@wordpress/url';
import {
	Placeholder,
	TextControl,
	Button,
	TabPanel,
} from '@wordpress/components';
import { layout } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import useTemplatePartPost from './use-template-part-post';
import TemplatePartPreviews from './template-part-previews';

export default function TemplatePartPlaceholder( { setAttributes } ) {
	const [ slug, _setSlug ] = useState( '' );
	const [ theme, setTheme ] = useState( '' );
	const [ help, setHelp ] = useState();

	// Try to find an existing template part.
	const postId = useTemplatePartPost( null, slug, theme );

	const setSlug = useCallback( ( nextSlug ) => {
		_setSlug( nextSlug );
		setHelp( cleanForSlug( nextSlug ) );
	}, [] );

	const { saveEntityRecord } = useDispatch( 'core' );
	const onChooseOrCreate = useCallback( async () => {
		const nextAttributes = { slug, theme };
		if ( postId !== undefined && postId !== null ) {
			// Existing template part found.
			nextAttributes.postId = postId;
		} else {
			// Create a new template part.
			try {
				const cleanSlug = cleanForSlug( slug );
				const templatePart = await saveEntityRecord(
					'postType',
					'wp_template_part',
					{
						title: cleanSlug,
						status: 'publish',
						slug: cleanSlug,
						meta: { theme },
					}
				);
				nextAttributes.postId = templatePart.id;
			} catch ( err ) {
				setHelp( __( 'Error adding template.' ) );
			}
		}
		setAttributes( nextAttributes );
	}, [ postId, slug, theme ] );

	const selectTemplate = ( selection ) => {
		setAttributes( selection );
	};

	const [ filterValue, setFilterValue ] = useState( '' );

	const createTab = (
		<>
			<div className="wp-block-template-part__placeholder-input-container">
				<TextControl
					label={ __( 'Slug' ) }
					placeholder={ __( 'header' ) }
					value={ slug }
					onChange={ setSlug }
					help={ help }
					className="wp-block-template-part__placeholder-input"
				/>
				<TextControl
					label={ __( 'Theme' ) }
					placeholder={ __( 'twentytwenty' ) }
					value={ theme }
					onChange={ setTheme }
					className="wp-block-template-part__placeholder-input"
				/>
			</div>
			<Button
				isPrimary
				disabled={ ! slug || ! theme }
				onClick={ onChooseOrCreate }
			>
				{ postId ? __( 'Choose' ) : __( 'Create' ) }
			</Button>
		</>
	);

	const selectTab = (
		<>
			<TextControl
				label={ __( 'Search' ) }
				placeholder={ __( 'header' ) }
				value={ filterValue }
				onChange={ setFilterValue }
				className="wp-block-template-part__placholder-filter-input"
			/>

			<div className="wp-block-template-part__preview-container">
				<TemplatePartPreviews
					selectTemplate={ selectTemplate }
					filterValue={ filterValue }
				/>
			</div>
		</>
	);

	return (
		<Placeholder icon={ layout } label={ __( 'Template Part' ) }>
			<TabPanel
				className="block-editor-inserter__tabs"
				tabs={ [
					{
						name: 'select',
						/* translators: Select tab of template part creation palceholder */
						title: __( 'Select from existing' ),
					},
					{
						name: 'create',
						/* translators: Create tab of template part placeholder.  */
						title: __( 'Create new' ),
					},
				] }
			>
				{ ( tab ) => {
					if ( tab.name === 'create' ) {
						return createTab;
					}
					return selectTab;
				} }
			</TabPanel>
		</Placeholder>
	);
}
