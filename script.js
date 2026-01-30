// Configuración
const config = {
    whatsappNumber: '5493764676093',
    developerWhatsappNumber: '5493765168963',
    instagramUrl: 'https://www.instagram.com/trazos_r.e.m?igsh=OXhzZXBsN2F1a3Jz',
    siteUrl: window.location.origin,
    defaultMessage: `¡Hola! 👋\n\nMe interesa esta prenda única de REM:\n\n¿Podrías darme más información sobre disponibilidad, talles y tiempo de entrega?`,
    developerMessage: `¡Hola Dilan! 👋\n\nVi el sitio web de REM y me encantó el diseño.\n\n¿Podrías darme información sobre tus servicios de desarrollo web?\n\n¡Gracias!`
};

// Estado global
let isModalOpen = false;
let currentProduct = null;
let currentImageIndex = 0;
let totalImages = 0;
let touchStartX = 0;
let touchEndX = 0;
const SWIPE_THRESHOLD = 50;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    // Año actual en footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Componentes
    initNavigation();
    initScrollEffects();
    initProductCards();
    initModal();
    initGalleryControls();
    initContactMethods();
    initAnimations();
    initImageErrorHandling();
    initKeyboardNavigation();
    initMobileOptimizations();
    initDeveloperLink();
    
    // Smooth page load
    window.addEventListener('load', () => {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.4s ease';
        
        requestAnimationFrame(() => {
            document.body.style.opacity = '1';
        });
    });
}

// Navegación
function initNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.header');

    if (!menuToggle || !nav) return;

    // Toggle menú móvil
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = !menuToggle.classList.contains('active');
        
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = isActive ? 'hidden' : '';
        menuToggle.setAttribute('aria-expanded', isActive);
        
        // Asegurar accesibilidad
        if (isActive) {
            const firstLink = nav.querySelector('a');
            if (firstLink) firstLink.focus();
        }
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('active') && 
            !nav.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Cerrar menú con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Cerrar menú al hacer clic en enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });

    // Header scroll
    let scrollTimeout;
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Ocultar/mostrar header al hacer scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.classList.add('scrolling', 'scrolled');
        } else {
            header.classList.remove('scrolling');
        }
        
        lastScrollTop = scrollTop;
        
        scrollTimeout = setTimeout(() => {
            header.classList.remove('scrolling');
            
            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, 100);
    });

    function closeMobileMenu() {
        menuToggle.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
    }
}

// Efectos de scroll
function initScrollEffects() {
    // Scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Actualizar URL sin recargar
                history.pushState(null, null, href);
            }
        });
    });
}

// Tarjetas de productos
function initProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach((card, index) => {
        // Animación de aparición
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
        
        // Evento para el botón "Más información"
        const viewBtn = card.querySelector('.product-view');
        
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                openProductModal(card);
            });
        }
        
        // Click en toda la tarjeta (excepto el botón)
        card.addEventListener('click', (e) => {
            if (viewBtn && e.target !== viewBtn && !viewBtn.contains(e.target)) {
                openProductModal(card);
            }
        });
        
        // Enter key para accesibilidad
        card.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && e.target === card) {
                e.preventDefault();
                openProductModal(card);
            }
        });
    });
}

// Modal de producto
function initModal() {
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    
    const backdrop = modal.querySelector('.modal-backdrop');
    const closeBtn = modal.querySelector('.modal-close');
    
    // Cerrar modal
    [backdrop, closeBtn].forEach(element => {
        if (element) {
            element.addEventListener('click', closeModal);
        }
    });
    
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isModalOpen) {
            closeModal();
        }
    });
    
    // Prevenir scroll cuando el modal está abierto
    const preventScroll = (e) => {
        if (isModalOpen) {
            e.preventDefault();
            return false;
        }
    };
    
    // Mejor manejo de scroll en móviles
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('wheel', preventScroll, { passive: false });
}

function openProductModal(card) {
    if (!card) return;
    
    currentProduct = card;
    currentImageIndex = 0;
    
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    
    const productId = card.getAttribute('data-product');
    const imagesCount = parseInt(card.getAttribute('data-images')) || 1;
    const productPrice = card.getAttribute('data-price') || '0';
    
    totalImages = imagesCount;
    
    // Actualizar información del producto
    const priceElement = document.getElementById('modal-product-price');
    const currentIndicator = document.getElementById('current-indicator');
    const totalIndicator = document.getElementById('total-indicator');
    
    if (priceElement) {
        const formattedPrice = parseInt(productPrice).toLocaleString('es-AR');
        priceElement.textContent = `$${formattedPrice}`;
        priceElement.setAttribute('aria-label', `${formattedPrice} pesos argentinos`);
    }
    
    if (currentIndicator) {
        currentIndicator.textContent = '1';
    }
    
    if (totalIndicator) {
        totalIndicator.textContent = imagesCount.toString();
    }
    
    // Cargar primera imagen
    loadImage(1, productId);
    
    // Actualizar miniaturas
    updateThumbnails(productId, imagesCount);
    
    // Mostrar/ocultar controles de navegación
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (prevBtn && nextBtn) {
        const shouldShowControls = imagesCount > 1;
        prevBtn.style.display = shouldShowControls ? 'flex' : 'none';
        nextBtn.style.display = shouldShowControls ? 'flex' : 'none';
        prevBtn.setAttribute('aria-hidden', !shouldShowControls);
        nextBtn.setAttribute('aria-hidden', !shouldShowControls);
    }
    
    // Actualizar botón de WhatsApp
    updateWhatsAppButton(productPrice, productId);
    
    // Mostrar modal
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    isModalOpen = true;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    
    // Enfocar el modal para accesibilidad
    setTimeout(() => {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
    }, 100);
}

function loadImage(imageNumber, productId) {
    const modalImage = document.getElementById('modal-image');
    if (!modalImage) return;
    
    // Mostrar indicador de carga
    modalImage.style.opacity = '0';
    
    // Crear URL de imagen
    const imageUrl = `imagenes/prenda${productId}/${imageNumber}.webp`;
    const altText = `Prenda ${productId} - Imagen ${imageNumber} de REM Arte Textil`;
    
    // Precargar imagen
    const img = new Image();
    img.src = imageUrl;
    img.alt = altText;
    
    img.onload = () => {
        modalImage.src = imageUrl;
        modalImage.alt = altText;
        
        // Animación suave de entrada
        requestAnimationFrame(() => {
            modalImage.style.transition = 'opacity 0.3s ease';
            modalImage.style.opacity = '1';
        });
        
        // Actualizar indicador
        const currentIndicator = document.getElementById('current-indicator');
        if (currentIndicator) {
            currentIndicator.textContent = imageNumber.toString();
        }
        
        // Actualizar miniatura activa
        updateActiveThumbnail(imageNumber - 1);
        
        // Actualizar índice actual
        currentImageIndex = imageNumber - 1;
        
        // Actualizar aria-label para accesibilidad
        modalImage.setAttribute('aria-label', altText);
    };
    
    img.onerror = () => {
        // Imagen de fallback
        modalImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjNDhhNmEiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTcgMjFhNCA0IDAgMDE0LTRWNWEyIDIgMCAwMTItMmg0YTIgMiAwIDAxMiAydjEyYTQgNCAwIDAxLTQgNHptMCAwaDEyYTIgMiAwIDAwMi0ydi00YTIgMiAwIDAwLTItMmgtMi4zNDNNMTEgNy4zNDNsMS42NTctMS42NTdhMiAyIDAgMDEyLjgyOCAwbDIuODI5IDIuODI5YTIgMiAwIDAxMCAyLjgyOGwtOC40ODYgOC40ODVNMTcgMTdoLjAxIi8+PC9zdmc+';
        modalImage.alt = 'Imagen no disponible - REM Arte Textil';
        modalImage.style.opacity = '0.5';
    };
}

function updateThumbnails(productId, imagesCount) {
    const thumbnailsContainer = document.getElementById('thumbnails');
    if (!thumbnailsContainer) return;
    
    thumbnailsContainer.innerHTML = '';
    
    for (let i = 1; i <= imagesCount; i++) {
        const thumbnail = document.createElement('div');
        thumbnail.className = i === 1 ? 'thumbnail active' : 'thumbnail';
        thumbnail.dataset.index = i - 1;
        thumbnail.tabIndex = 0;
        thumbnail.setAttribute('role', 'tab');
        thumbnail.setAttribute('aria-label', `Ver imagen ${i}`);
        thumbnail.setAttribute('aria-selected', i === 1);
        
        const img = document.createElement('img');
        img.src = `imagenes/prenda${productId}/${i}.webp`;
        img.alt = `Miniatura ${i} de la prenda`;
        img.loading = 'lazy';
        img.decoding = 'async';
        
        // Precargar miniaturas
        const preloadImg = new Image();
        preloadImg.src = img.src;
        
        // Evento para cambiar imagen
        const handleThumbnailClick = () => {
            loadImage(i, productId);
            thumbnail.focus();
        };
        
        thumbnail.addEventListener('click', handleThumbnailClick);
        
        // Enter key para accesibilidad
        thumbnail.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleThumbnailClick();
            }
        });
        
        thumbnail.appendChild(img);
        thumbnailsContainer.appendChild(thumbnail);
    }
}

function updateActiveThumbnail(index) {
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, i) => {
        const isActive = i === index;
        thumb.classList.toggle('active', isActive);
        thumb.setAttribute('aria-selected', isActive);
        thumb.setAttribute('tabindex', isActive ? '0' : '-1');
    });
}

function updateWhatsAppButton(price, productId) {
    const whatsappBtn = document.querySelector('.whatsapp-modal-btn');
    if (!whatsappBtn) return;
    
    const formattedPrice = parseInt(price).toLocaleString('es-AR');
    
    const message = `${config.defaultMessage}\n\n💰 Precio: $${formattedPrice}\n🆔 Producto: ${productId}`;
    
    whatsappBtn.href = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function closeModal() {
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    isModalOpen = false;
    
    // Restaurar scroll
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
    
    // Limpiar estado
    currentProduct = null;
    currentImageIndex = 0;
    totalImages = 0;
    
    // Restaurar foco al elemento que abrió el modal
    setTimeout(() => {
        if (currentProduct) {
            const viewBtn = currentProduct.querySelector('.product-view');
            if (viewBtn) viewBtn.focus();
        }
    }, 100);
}

// Controles de galería
function initGalleryControls() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const mainImage = document.querySelector('.main-image-container');
    
    // Navegación anterior
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateGallery('prev');
        });
    }
    
    // Navegación siguiente
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateGallery('next');
        });
    }
    
    // Swipe para móviles
    if (mainImage) {
        mainImage.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        mainImage.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }
    
    // Click en imagen para avanzar (solo en móvil)
    if (mainImage) {
        mainImage.addEventListener('click', (e) => {
            // Solo en móviles y si hay más de una imagen
            if (window.innerWidth <= 768 && totalImages > 1 && 
                !e.target.closest('.control-btn') &&
                !e.target.closest('.thumbnail')) {
                const rect = mainImage.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                
                // Click en la mitad derecha = siguiente, izquierda = anterior
                if (clickX > rect.width / 2) {
                    navigateGallery('next');
                } else {
                    navigateGallery('prev');
                }
            }
        });
    }
}

function navigateGallery(direction) {
    if (!currentProduct || totalImages <= 1) return;
    
    let newIndex;
    const productId = currentProduct.getAttribute('data-product');
    
    if (direction === 'next') {
        newIndex = (currentImageIndex + 1) % totalImages;
    } else {
        newIndex = (currentImageIndex - 1 + totalImages) % totalImages;
    }
    
    loadImage(newIndex + 1, productId);
}

function handleSwipe() {
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
        if (diff > 0) {
            // Swipe izquierda = siguiente imagen
            navigateGallery('next');
        } else {
            // Swipe derecha = imagen anterior
            navigateGallery('prev');
        }
    }
}

// Métodos de contacto
function initContactMethods() {
    const whatsappBtn = document.querySelector('.contact-method.whatsapp');
    const instagramBtn = document.querySelector('.contact-method.instagram');
    
    if (whatsappBtn) {
        const message = `¡Hola! 👋\n\nMe interesa conocer más sobre los diseños únicos de REM.\n\n¿Podrías darme información sobre talles disponibles, tiempos de entrega y opciones de personalización?\n\n¡Gracias!`;
        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`;
        
        whatsappBtn.href = url;
        
        // Mejorar accesibilidad
        whatsappBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                whatsappBtn.click();
            }
        });
    }
    
    if (instagramBtn) {
        instagramBtn.href = config.instagramUrl;
        
        // Mejorar accesibilidad
        instagramBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                instagramBtn.click();
            }
        });
    }
}

// Enlace del desarrollador
function initDeveloperLink() {
    const developerLink = document.querySelector('.developer-link');
    if (developerLink) {
        const encodedMessage = encodeURIComponent(config.developerMessage);
        developerLink.href = `https://wa.me/${config.developerWhatsappNumber}?text=${encodedMessage}`;
        
        // Mejorar accesibilidad
        developerLink.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                developerLink.click();
            }
        });
    }
}

// Animaciones
function initAnimations() {
    // Observador de intersección para lazy loading
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '50px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observar elementos
        document.querySelectorAll('section, .product-card, .contact-method').forEach(el => {
            if (el) observer.observe(el);
        });
    }
    
    // Efecto parallax suave para hero
    const hero = document.querySelector('.hero');
    if (hero && window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }
}

// Manejo de errores en imágenes
function initImageErrorHandling() {
    // Manejar errores de carga de imágenes
    document.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG') {
            const img = e.target;
            if (!img.dataset.fallbackHandled) {
                img.dataset.fallbackHandled = true;
                img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjNDhhNmEiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTcgMjFhNCA0IDAgMDE0LTRWNWEyIDIgMCAwMTItMmg0YTIgMiAwIDAxMiAydjEyYTQgNCAwIDAxLTQgNHptMCAwaDEyYTIgMiAwIDAwMi0ydi00YTIgMiAwIDAwLTItMmgtMi4zNDNNMTEgNy4zNDNsMS42NTctMS42NTdhMiAyIDAgMDEyLjgyOCAwbDIuODI5IDIuODI5YTIgMiAwIDAxMCAyLjgyOGwtOC40ODYgOC40ODVNMTcgMTdoLjAxIi8+PC9zdmc+';
                img.alt = 'Imagen no disponible - REM Arte Textil';
                img.style.opacity = '0.3';
            }
        }
    }, true);
}

// Navegación por teclado
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (!isModalOpen) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                navigateGallery('prev');
                break;
            case 'ArrowRight':
                e.preventDefault();
                navigateGallery('next');
                break;
            case 'Tab':
                // Mantener el foco dentro del modal
                const modal = document.getElementById('product-modal');
                const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
                break;
            case 'Escape':
                closeModal();
                break;
        }
    });
}

// Optimizaciones móviles
function initMobileOptimizations() {
    // Detectar si es móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Optimizar para móviles
        document.documentElement.style.setProperty('--transition', 'all 0.2s ease');
        
        // Mejorar rendimiento de scroll
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
        
        // Precargar imágenes críticas
        const criticalImages = [
            'imagenes/icono/ico.webp',
            'imagenes/prenda1/1.webp',
            'imagenes/prenda2/1.webp'
        ];
        
        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    
    // Manejar cambios de orientación
    let orientationTimeout;
    window.addEventListener('orientationchange', () => {
        clearTimeout(orientationTimeout);
        orientationTimeout = setTimeout(() => {
            // Recalcular dimensiones del modal
            if (isModalOpen) {
                const modalImage = document.getElementById('modal-image');
                if (modalImage) {
                    modalImage.style.transform = 'scale(1)';
                }
            }
            
            // Recalcular altura del viewport en iOS
            document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        }, 300);
    });
    
    // Arreglo para iOS 100vh issue
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
}

// Manejo de resize y orientación
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recalcular si es necesario cuando el modal está abierto
        if (isModalOpen) {
            const modalImage = document.getElementById('modal-image');
            if (modalImage) {
                modalImage.style.transform = 'scale(1)';
            }
        }
    }, 250);
});

// Optimización de performance con IntersectionObserver
if ('IntersectionObserver' in window) {
    // Lazy loading para imágenes que no están en viewport
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '200px'
    });
    
    // Observar imágenes con data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Mejorar accesibilidad
document.addEventListener('DOMContentLoaded', () => {
    // Asegurar que todos los botones tengan tipo button
    document.querySelectorAll('button:not([type])').forEach(button => {
        button.setAttribute('type', 'button');
    });
    
    // Mejorar focus visible para navegación por teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Añadir etiquetas ARIA a elementos dinámicos
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.setAttribute('aria-labelledby', 'modal-title');
    }
});

// Debug helper para desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('REM - Modo desarrollo activado');
    
    // Mostrar errores de imágenes en consola
    window.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG') {
            console.warn('Error cargando imagen:', e.target.src);
        }
    }, true);
}

// Exportar funciones principales para depuración (solo en desarrollo)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.REM = {
        openProductModal,
        closeModal,
        navigateGallery,
        config
    };
}