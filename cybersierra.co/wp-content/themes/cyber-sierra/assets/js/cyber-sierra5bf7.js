/* global $ ajaxUrl siteUrl gsap SplitType mailchimpSF */
(function($) {
	$( document ).ready( function() {
		const tag = '';
		const cat = [];
		const sort = '';
		let ppp = 6;
		let page = 1;
		let initial = true;

		$( '.load-more > button' ).on( 'click', function() {
			if ( initial ) {
				ppp = 6;
				page++;
				initial = false;
			} else {
				page++;
			}

			$( '.loading-container' ).css( 'display', 'block' );
			$( '.blog-list-container .right-container .right-inner .load-more' ).remove();

			getBlogPost();
		} );

		function setCookie( cname, cvalue, exdays ) {
			const d = new Date();
			// eslint-disable-next-line no-mixed-operators
			d.setTime( d.getTime() + exdays * 24 * 60 * 60 * 1000 );
			const expires = 'expires=' + d.toUTCString();
			document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
		}

		function getBlogPost( type ) {
			const tagValue = tag;
			const catValue = cat;
			const sortValue = sort;
			const pageValue = page;
			const pppValue = ppp;

			$.ajax( {
				type: 'POST',
				url: ajaxUrl,
				dataType: 'json',
				data: {
					action: 'cs_blog_post_ajax',
					tag: tagValue,
					cat: catValue,
					sort: sortValue,
					page: pageValue,
					ppp: pppValue,
				},
				success: ( data ) => {
					if ( type === 'filter' ) {
						$( '.blog-list-container .right-container .right-inner .blogs' ).empty();
						$( '.blog-list-container .right-container .right-inner .load-more' ).remove();
					}

					if ( type !== 'filter' ) {
						$( '.loading-container' ).css( 'display', 'none' );
					}

					if ( data.button ) {
						$( '.blog-list-container .right-container .right-inner' ).append( data.button );

						$( '.load-more > button' ).on( 'click', function() {
							if ( initial ) {
								ppp = 6;
								page++;
								initial = false;
							} else {
								page++;
							}

							$( '.loading-container' ).css( 'display', 'block' );
							$( '.blog-list-container .right-container .right-inner .load-more' ).remove();

							getBlogPost();
						} );
					}

					if ( data.max_page === pageValue ) {
						$( '.blog-list-container .right-container .right-inner .load-more' ).remove();
					}

					$( '.blog-list-wrapper .ajax-container' ).append( data.content );
				},
			} );
		}

		const buttonRequestDemo = $( '#masthead .menu-right-menu-container ul li a' );

		const buttonText = $( buttonRequestDemo ).text();
		const html = `${ buttonText } <div class="arrow arrow--right"><span></span></div>`;
		$( buttonRequestDemo ).html( html );

		function hexc( colorval ) {
			const parts = colorval.match( /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/ );
			delete parts[ 0 ];
			for ( let i = 1; i <= 3; ++i ) {
				parts[ i ] = parseInt( parts[ i ] ).toString( 16 );
				if ( parts[ i ].length === 1 ) {
					parts[ i ] = '0' + parts[ i ];
				}
			}
			return '#' + parts.join( '' );
		}

		if ( $( '.text-with-cta:last' ).length > 0 ) {
			const x = $( '.text-with-cta:last' ).css( 'backgroundColor' );
			if ( x !== 'rgba(0, 0, 0, 0)' ) {
				const color = hexc( x );
				$( '.footer-container' ).css( 'background-color', color );
			}
		}

		function validateEmail( mail ) {
			if ( /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test( mail ) ) {
				return '';
			}
			return 'Please input your valid email address';
		}

		function getError( parent, fieldName, message ) {
			let errMsg = "<span class='mc_error_msg' style='margin-bottom: 0;' > <p style='font-size: 12px; margin: 0; line-height: 16px'>";

			const fieldContainer = $( parent )
				.children( '.mc4wp-form-fields' )
				.children( '.form-container' )
				.children( '.form-inner' )
				.children( ' div' )
				.children( '.field-item' )
				.has( `.form-${ fieldName }` );

			errMsg += message;
			errMsg += '</p></span>';

			$( fieldContainer ).addClass( 'form-invalid' );
			$( fieldContainer ).children( '.mc_error_msg' ).remove();
			$( fieldContainer ).append( errMsg );
		}

		function checkFormField( form, fieldName, value ) {
			switch ( fieldName ) {
				case 'NAME':
					if ( ! value ) {
						getError( form, 'name', 'Please input your name' );
						return false;
					}
					return true;

				case 'EMAIL':
					if ( ! value || validateEmail( value ) ) {
						getError( form, 'email', validateEmail( value ) );
						return false;
					}
					return true;

				default:
					return true;
			}
		}

		$( '.form-subscription .mc4wp-form' ).on( 'keyup change paste', 'input', function( event ) {
			if ( event.keyCode === 9 ) {
				return;
			}

			const dataType = $( this ).attr( 'name' );
			const value = $( this ).val();

			if ( $( this ).parent( 'div' ).parent( 'div' ).hasClass( 'form-invalid' ) ) {
				const res = checkFormField( dataType, value );
				if ( res ) {
					$( this ).parent( 'div' ).parent( 'div' ).removeClass( 'form-invalid' );
					$( this ).parent( 'div' ).parent( 'div' ).children( '.mc_error_msg' ).remove();
				}
			}
			const form = $( this )
				.parent( 'div' )
				.parent( 'div' )
				.parent( 'div' )
				.parent( 'div' )
				.parent( 'div' )
				.parent( 'div' )
				.parent( 'form' );

			if ( ! value ) {
				checkFormField( form, dataType, value );
			}
		} );

		$( '.form-subscription .mc4wp-form .button-container #submit-btn' ).on( 'click', function( event ) {
			event.preventDefault();

			$( '.mc4wp-form .mc_error_msg' ).remove();
			$( '.mc4wp-form .button-container #submit-btn' ).attr( 'disabled', true );

			const fieldItem = $( '.mc4wp-form .form-container .field-item.form-invalid' );
			$( fieldItem ).removeClass( 'form-invalid' );

			const form = $( this ).parent( 'div' ).parent( 'div' ).parent( 'div' ).parent( 'form' );
			const subscriptionFormData = form.serializeArray();

			const invalidName = checkFormField( form, 'NAME', subscriptionFormData[ 0 ].value );
			const invalidEmail = checkFormField( form, 'EMAIL', subscriptionFormData[ 1 ].value );

			if ( ! invalidName || ! invalidEmail ) {
				$( '.mc4wp-form .button-container #submit-btn' ).attr( 'disabled', false );
				return false;
			}

			const jsonData = {};
			subscriptionFormData.forEach( ( item ) => {
				jsonData[ item.name ] = item.value;
			} );

			$.post( mailchimpSF.ajax_url, jsonData, function( data ) {
				const reg = new RegExp( "class='mc_error_msg'", 'i' );

				if ( reg.test( data ) ) {
					$( '.mc4wp-form' ).each( function() {
						this.reset();
					} );

					$( '.mc_signup_submit .button' ).attr( 'disabled', false );
					return false;
				}

				$( ' .form-subscription' ).addClass( 'hidden' );
				$( ' .form-subscription' ).removeClass( 'active' );

				$( ' .form-subscribed' ).addClass( 'active' );
				$( ' .form-subscribed' ).removeClass( 'hidden' );

				$( ' .mobile-subscription ' ).addClass( 'd-none' );
				setCookie( 'subscribed', true );
				return true;
			} );
		} );

		$( '.post__content-layout a' ).attr( 'target', '_blank' );

		$( '.post__content-layout .wp-block-rank-math-toc-block a' ).removeAttr('target');

		$( '.post__content-layout h2' ).each(function() {
			const slug = $(this).text().toLowerCase()
				.trim()
				.replace(/[^\w\s-]/g, '')
				.replace(/[\s_-]+/g, '-')
				.replace(/^-+|-+$/g, '');

			$(this).attr(id, slug);
		});

		// $( '.request-button, .request-btn, .demo' ).on( 'click', function( e ) {
		// 	e.preventDefault();
		// 	$( '.request-modal' ).modal( 'show' );
		// } );

		$( '.redeem' ).on( 'click', function( e ) {
			e.preventDefault();
			$( '.redeem-modal' ).modal( 'show' );
		} );

		function preventScroll( element ) {
			if ( ! element || element.length <= 0 ) {
				return;
			}
			element.addEventListener( 'show.bs.modal', function() {
				$( 'html' ).addClass( 'modal-open' );
			} );
		}

		function allowScroll( element ) {
			if ( ! element || element.length <= 0 ) {
				return;
			}
			element.addEventListener( 'hide.bs.modal', function() {
				$( 'html' ).removeClass( 'modal-open' );
			} );
		}

		const requestModal = $( '.request-modal' ).get( 0 );
		allowScroll( requestModal );
		preventScroll( requestModal );

		const shareArticleModal = $( '#share-article-modal' ).get( 0 );
		allowScroll( shareArticleModal );
		preventScroll( shareArticleModal );

		const inputs = $( '.input-contain' );

		for ( let i = 0; i < inputs.length; i++ ) {
			if ( ! $( inputs[ i ] ).hasClass( 'text-area' ) ) {
				const sibling = $( inputs[ i ] ).find( '.placeholder-text' );
				const input = $( inputs[ i ] ).find( '.wpcf7-form-control-wrap' );
				input.append( sibling[ 0 ] );
			} else {
				const sibling = $( inputs[ i ] ).find( '.placeholder-text' );
				inputs[ i ].prepend( sibling[ 0 ] );
			}
		}

		$( 'img.hamburger' ).on( 'click', function() {
			$( this ).css( 'display', 'none' );
			$( 'img.hamburger.hamburger-toggle' ).css( 'display', 'block' );
		} );

		$( '#mobileNavModal' ).on( 'click', function() {
			$( 'img.hamburger' ).css( 'display', 'block' );
			$( 'img.hamburger.hamburger-toggle' ).css( 'display', 'none' );
		} );

		$( '#masthead .menu-primary-menu-container .menu-item-has-children > a' ).on( 'click', function( event ) {
			event.preventDefault();
			event.stopPropagation();
		} );

		$( '#mobileNavModal #mobile-menu li.menu-item-has-children > a' ).on( 'click', function( event ) {
			event.stopPropagation();
			event.preventDefault();

			const subMenu = $(this).siblings('.sub-menu');

			console.log(subMenu);

			if ( ! $( this ).hasClass( 'active' ) ) {
				$( this ).addClass( 'active' );
				const height = $( subMenu ).prop( 'scrollHeight' ) + 'px';
				$( subMenu ).css( 'max-height', height );
			} else {
				$( this ).removeClass( 'active' );
				$( subMenu ).css( 'max-height', '0px' );
			}
		} );

		$( 'input' ).on( 'change', function() {
			const input = $( this );
			const parent = $( this ).parents( '.input-contain' );

			if ( input.val().length ) {
				parent.addClass( 'filled' );
			} else {
				parent.removeClass( 'filled' );
			}
		} );

		function appendCountries( countries ) {
			let items = '';
			$.each( countries, function( index, value ) {
				items +=
					'<span class="dropdown-item" data-name=' +
					value.name +
					' data-code=' +
					value.dial_code +
					' data-flag=' +
					value.flag +
					'>' +
					value.flag +
					' (' +
					value.dial_code +
					')</span>';
			} );
			$( '.dial-code .dropdown-menu .country-list' ).append( items );
		}

		let countries;
		if ( $( '.dial-code .dropdown-menu' ).length > 0 ) {
			$.ajax( {
				url: siteUrl + '/wp-content/themes/cyber-sierra/assets/data/country.json',
				type: 'GET',
				dataType: 'json',
				success: ( response ) => {
					countries = response;
					appendCountries( response );
				},
				error: ( jqXHR, textStatus, errorThrown ) => {
					// eslint-disable-next-line no-console
					console.log( textStatus, errorThrown );
				},
			} );
		}

		// Save Dial Code
		let selectedDialCode = '';

		$( '.dial-code .dropdown-menu' ).on( 'click', 'span', function() {
			const dialCode = $( this ).data( 'code' );
			const dialName = $( this ).data( 'name' );
			const flag = $( this ).data( 'flag' );

			$( '#dropdown-dial-code .flag' ).empty();
			$( '#dropdown-dial-code .flag' ).append( flag );

			$( '.dial-code .dropdown-item' ).removeClass( 'active' );

			$( this ).addClass( 'active' );

			selectedDialCode = dialName;
			appendCountries( countries );

			$( '#dropdown-dial-code .code' ).empty();
			$( '#dropdown-dial-code .code' ).append( '(' + dialCode + ')' );

			$( '#dial-code' ).val( dialCode );
			$( '.code-search' ).val( '' );

			$( '.dial-code .fields .dropdown-toggle .code' ).addClass( 'filled' );

			$( 'input[type="hidden"][name="country-code"]' ).val( '(' + dialCode + ')' );

			$( '.dial-code .dropdown-menu, .dial-code .dropdown-toggle' ).removeClass( 'show' );
		} );

		$( '.dropdown-toggle' ).on( 'click', function() {
			if ( $( this ).parent().hasClass( 'fields' ) ) {
				const dropdown = $( this ).parent().find( '.dropdown-menu' );
				if ( ! $( this ).hasClass( 'show' ) ) {
					$( this ).addClass( 'show' );
					$( dropdown ).addClass( 'show' );
				} else {
					$( this ).removeClass( 'show' );
					$( dropdown ).removeClass( 'show' );
				}
			}
		} );

		$( '.placeholder-text' ).on( 'click', function() {
			const text = $( this );
			text.parent().find( 'input' ).focus();
		} );

		$( '.wpcf7-text, .wpcf7-textarea' ).on( 'keyup', function() {
			if ( this.value !== '' ) {
				$( this ).addClass( 'not-empty' );
			} else {
				$( this ).removeClass( 'not-empty' );
			}
		} );

		$( '.cookie-settings' ).click( function( e ) {
			e.preventDefault();
			$( 'body' ).find( '.cky-btn-revisit-wrapper' ).click();
		} );

		$( '.code-search' ).keyup( function( e ) {
			const searchKey = e.target.value.toLowerCase();
			const filteredCountry = countries.filter( ( country ) => country.name.toLowerCase().match( searchKey ) );
			$( '.dial-code .dropdown-menu .country-list' ).empty();
			appendCountries( filteredCountry );

			if ( selectedDialCode ) {
				if ( $( '.country-list' ).find( '.dropdown-item[data-name=' + selectedDialCode + ']' ).length > 0 ) {
					$( '.country-list' )
						.find( '.dropdown-item[data-name=' + selectedDialCode + ']' )
						.addClass( 'active' );
				}
			}
		} );

		$( '#masthead' ).removeClass( 'loading' );

		$( '#masthead .request-btn a' ).append( '<div class="arrow arrow--right"><span></span></div>' );

		// device detection
		if (
			/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
				navigator.userAgent
			) ||
			/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
				navigator.userAgent.substr( 0, 4 )
			)
		) {
			$( 'body' ).addClass( 'isMobile' );
		}

		// Collect items for table of contents

		const contentList = $( '#contents-dropdown-list' );
		const h2List = $( '.post__content-left h2' );
		const dropdownMenuText = $( '#dropdownMenuLink .dropdownMenuText' ).get( 0 );

		let elements = $();

		h2List.each( function( index ) {
			const text = $( this ).text();
			const id = 'table-of-content-item-' + index;
			const liTag = document.createElement( 'li' );
			const aTag = document.createElement( 'a' );
			const headingContent = this;

			$( this ).attr( 'id', id );
			$( aTag ).addClass( 'dropdown-item' );
			$( aTag ).text( text );

			aTag.addEventListener( 'click', function() {
				$( dropdownMenuText ).text( text );
				$( headingContent ).css( { scrollMargin: '80px' } );
				headingContent.scrollIntoView();
			} );
			liTag.append( aTag );

			elements = elements.add( liTag );
		} );
		contentList.append( elements );

		// Make table of contents sticky on tablet and mobile devices
		const contentDropdown = $( '.contents-dropdown' ).get( 0 );
		const contentContainer = $( '.contents-dropdown-container' ).get( 0 );
		const contentDropdownList = $( '#contents-dropdown-list' ).get( 0 );
		const widthSelectElement = $( '.contents-dropdown' ).width();

		if ( contentContainer ) {
			$( window ).scroll( function() {
				const TABLET = 1279;
				const MOBILE = 768;

				const spacingValue = window.screen.width > MOBILE ? '32px' : '24px';
				const paddingContentList = window.screen.width > MOBILE ? 'calc(100vw - 64px)' : 'calc(100vw - 48px)';
				const reachTopScreen = contentContainer.getBoundingClientRect().top <= 10;
				const isSmallerThanDesktop = $( window ).width() <= TABLET;
				const isSmallerThanTablet = $( window ).width() <= MOBILE;
				let contentsDropDownPaddingY = '24px';

				if ( isSmallerThanDesktop ) {
					contentsDropDownPaddingY = '20px';
				}
				if ( isSmallerThanTablet ) {
					contentsDropDownPaddingY = '16px';
				}

				if ( reachTopScreen && isSmallerThanDesktop ) {
					const contentDropdownHeight = $( contentDropdown ).height();
					$( contentContainer ).height( contentDropdownHeight );
					$( contentDropdownList ).css( {
						marginLeft: spacingValue,
						marginTop: '32px',
						top: '110%',
						width: paddingContentList,
					} );

					$( contentDropdown ).css( {
						position: 'fixed',
						top: '0',
						right: '0',
						left: '0',
						width: '100%',
						paddingRight: spacingValue,
						paddingLeft: spacingValue,
						paddingTop: contentsDropDownPaddingY,
						paddingBottom: contentsDropDownPaddingY,
					} );
				} else {
					$( contentDropdownList ).css( {
						marginLeft: 0,
						marginTop: 'unset',
						width: widthSelectElement,
						top: '150%',
					} );
					$( contentDropdown ).css( {
						position: 'static',
						top: 'unset',
						right: 'unset',
						paddingRight: '0',
						paddingLeft: '0',
						paddingTop: '0',
						paddingBottom: '0',
					} );
					$( contentContainer ).height( 'auto' );
				}
			} );
		}
		$( contentDropdownList ).css( 'width', widthSelectElement );

		// Button copy link
		$( '.social-btn-group .share-btn' ).each( function() {
			$( this ).tooltip( {
				trigger: 'click',
				title: 'Link copied',
				placement: 'top',
			} );

			const btnShare = $( this );

			this.addEventListener( 'click', function() {
				const dummy = document.createElement( 'input' ),
					text = window.location.href;
				document.body.appendChild( dummy );
				dummy.value = text;
				dummy.select();
				document.execCommand( 'copy' );
				document.body.removeChild( dummy );
				setTimeout( function() {
					btnShare.tooltip( 'hide' );
				}, 1500 );
			} );
		} );

		// Handler close banner
		const closeBannerBtn = document.querySelector( '.banner-close-btn' );

		closeBannerBtn.addEventListener( 'click', () => {
			const banner = document.querySelector( '.banner' );
			banner.classList.add( 'banner-hide' );
		} );
		
		// handle pricing modal
		const buttonDropdown = $( '.pricing .request-pricing form .dropdown button > div' );
		const inputSelectedPlan = $( '.pricing .request-pricing form input[name="selectedPlan"]' );
		const planOptions = $('.pricing .request-pricing form .dropdown .dropdown-menu li a').map(function() { return this.innerText; });
		
		$('.pricing .request-pricing .overlay').click(() => {
			$('.pricing .request-pricing').addClass('hidden');
		});

		$('.pricing .request-pricing .close-popup-button').click(() => {
			$('.pricing .request-pricing').addClass('hidden');
		});

		$('.pricing .request-pricing-btn').click((e) => {
			const selectedCol = Number(e.target.dataset.col);
			const option = planOptions[selectedCol - 1];
			$(inputSelectedPlan).val(option);

			$( buttonDropdown ).empty();
			let currentOps = '<label style="color: #1c1c3c;">';
			currentOps += option;
			currentOps += '</label>';

			$( buttonDropdown ).append( currentOps );

			$('.pricing .request-pricing').removeClass('hidden');
		});
		
		$( '.pricing .request-pricing form ul.dropdown-menu li' ).each( function( idx, ele ) {
			$( ele ).on( 'click', function() {
				const formField = $( this ).parent( 'ul' ).parent( 'div' ).parent( 'div' );
				if ( $( formField ).hasClass( 'form-invalid' ) ) {
					$( formField ).removeClass( 'form-invalid' );
					$( formField ).children( '.mc_error_msg' ).remove();
				}

				const option = $( ele ).attr( 'target' );
				$( inputSelectedPlan ).val( option );
				$( buttonDropdown ).empty();

				let currentOps = '<label style="color: #1c1c3c;">';
				currentOps += option;
				currentOps += '</label>';

				$( buttonDropdown ).append( currentOps );
			} );
		});

		const pricingPage = $('.pricing');
		if (pricingPage && pricingPage.length > 0) {
			$('.pricing .pricing-block .table-row .cell').on('mouseenter', function() {
				const hoverCol = Number($(this).data('col'));
				switch (hoverCol) {
					case 1:
						$(`.pricing .pricing-block .table-row .cell[data-col="1"]`).addClass('hovered');
						$(`.pricing .pricing-block .table-row .cell[data-col="2"]`).removeClass('hovered');
						$(`.pricing .pricing-block .table-row .cell[data-col="3"]`).removeClass('hovered');
						break;
					case 2:
						$(`.pricing .pricing-block .table-row .cell[data-col="1"]`).removeClass('hovered');
						$(`.pricing .pricing-block .table-row .cell[data-col="2"]`).addClass('hovered');
						$(`.pricing .pricing-block .table-row .cell[data-col="3"]`).removeClass('hovered');
						break;
					case 3:
						$(`.pricing .pricing-block .table-row .cell[data-col="1"]`).removeClass('hovered');
						$(`.pricing .pricing-block .table-row .cell[data-col="2"]`).removeClass('hovered');
						$(`.pricing .pricing-block .table-row .cell[data-col="3"]`).addClass('hovered');
						break;
					default:
						$(`.pricing .pricing-block .table-row .cell`).removeClass('hovered');
						break;
				}
				if (Number(hoverCol) > 0) {
					$(`.pricing .pricing-block .table-row .cell[data-col="${hoverCol}"]`).addClass('hovered');
				} 
			});

			$('.pricing .pricing-block .table-body').on('mouseleave', function() {
				$(`.pricing .pricing-block .table-row .cell`).removeClass('hovered');
			});
		}
	} );

	$( '.wpcf7-submit' ).on( 'click', function() {
		$( '.button-text', this ).addClass( 'hide' );
		$( '.spinner', this ).show();
	} );

	document.addEventListener(
		'wpcf7submit',
		function() {
			$( '.button-text', this ).removeClass( 'hide' );
			$( '.spinner', this ).hide();
		},
		false
	);

	document.addEventListener(
		'wpcf7mailsent',
		function() {
			if ( $( '.request-modal' ).hasClass( 'show' ) ) {
				$( '.request-modal' ).modal( 'hide' );
			}

			if ( $( '.redeem-modal' ).hasClass( 'show' ) ) {
				$( '.redeem-modal' ).modal( 'hide' );
			}

			$( '.wpcf7-form .input-contain' ).removeClass( 'filled' );

			$( '.button-text', this ).removeClass( 'hide' );
			$( '.spinner', this ).hide();
			$( '.toaster' ).addClass( 'show' );

			setTimeout( function() {
				$( '.toaster' ).removeClass( 'show' );
			}, 3500 );

			$('.download-report-form .wpcf7').addClass('hide');
			$('.download-report-form .form-success').removeClass('hide');
		},
		false
	);
})(jQuery);

function simple_debounce( func, timeout = 300 ) {
	let timer;
	return ( ...args ) => {
	  clearTimeout( timer );
	  timer = setTimeout( () => {
			func.apply( this, args );
		}, timeout );
	};
}
