import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Translations
const translations = {
  en: {
    // Header
    home: 'Home',
    products: 'Products',
    cart: 'Cart',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    adminDashboard: 'Admin Dashboard',
    
    // Home
    welcomeTitle: 'Discover Your Signature Scent',
    welcomeSubtitle: 'Luxury Perfumes for Every Occasion',
    shopNow: 'Shop Now',
    featuredProducts: 'Featured Products',
    addToCart: 'Add to Cart',
    
    // Products
    allProducts: 'All Products',
    filterByCategory: 'Filter by Category',
    all: 'All',
    men: 'Men',
    women: 'Women',
    unisex: 'Unisex',
    sortBy: 'Sort by',
    priceAsc: 'Price: Low to High',
    priceDesc: 'Price: High to Low',
    nameAsc: 'Name: A-Z',
    nameDesc: 'Name: Z-A',
    viewDetails: 'View Details',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    page: 'Page',
    of: 'of',
    previous: 'Previous',
    next: 'Next',
    
    // Product Details
    description: 'Description',
    fragranceNotes: 'Fragrance Notes',
    availability: 'Availability',
    category: 'Category',
    reviews: 'Reviews',
    
    // Cart
    shoppingCart: 'Shopping Cart',
    emptyCart: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    quantity: 'Quantity',
    price: 'Price',
    total: 'Total',
    remove: 'Remove',
    proceedToCheckout: 'Proceed to Checkout',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    calculated: 'Calculated at checkout',
    
    // Checkout & Payment
    checkout: 'Checkout',
    paymentSuccess: 'Payment Successful',
    orderConfirmed: 'Your order has been confirmed!',
    orderNumber: 'Order Number',
    thankYou: 'Thank you for your purchase',
    continueBrowsing: 'Continue Browsing',
    
    // Auth
    email: 'Email',
    password: 'Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    confirmPassword: 'Confirm Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    signUp: 'Sign Up',
    haveAccount: 'Already have an account?',
    signIn: 'Sign In',
    
    // Admin
    users: 'Users',
    orders: 'Orders',
    adminProducts: 'Products',
    dashboard: 'Dashboard',
    totalUsers: 'Total Users',
    activeUsers: 'Active Users',
    totalRevenue: 'Total Revenue',
    ordersToday: 'Orders Today',
    userManagement: 'User Management',
    orderManagement: 'Order Management',
    productManagement: 'Product Management',
    addProduct: 'Add Product',
    name: 'Name',
    brand: 'Brand',
    stock: 'Stock',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    customer: 'Customer',
    amount: 'Amount',
    role: 'Role',
    joined: 'Joined',
    orderId: 'Order ID',
    orderDetails: 'Order Details',
    customerDetails: 'Customer Details',
    orderStatus: 'Order Status',
    orderItems: 'Order Items',
    product: 'Product',
    
    // Actions
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    back: 'Back',
    search: 'Search',
    confirm: 'Confirm',
    close: 'Close',
    update: 'Update',
    
    // Status
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
    active: 'Active',
    inactive: 'Inactive',
    admin: 'Admin',
    moderator: 'Moderator',
    user: 'User',
    
    // Messages
    addedToCart: 'Added to cart',
    removedFromCart: 'Removed from cart',
    orderPlaced: 'Order placed successfully',
    error: 'An error occurred',
    success: 'Success',
    deleteConfirm: 'Are you sure you want to delete this item?',
    actionCannotBeUndone: 'This action cannot be undone.',
    
    // Footer
    aboutUs: 'About Us',
    contactUs: 'Contact Us',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    allRightsReserved: 'All rights reserved',
  },
  sl: {
    // Header
    home: 'Domov',
    products: 'Izdelki',
    cart: 'Košarica',
    login: 'Prijava',
    register: 'Registracija',
    logout: 'Odjava',
    adminDashboard: 'Admin Nadzorna Plošča',
    
    // Home
    welcomeTitle: 'Odkrijte Svoj Značilni Vonj',
    welcomeSubtitle: 'Luksuzni Parfumi za Vsako Priložnost',
    shopNow: 'Nakupuj Zdaj',
    featuredProducts: 'Izbrani Izdelki',
    addToCart: 'Dodaj v Košarico',
    
    // Products
    allProducts: 'Vsi Izdelki',
    filterByCategory: 'Filtriraj po Kategoriji',
    all: 'Vse',
    men: 'Moški',
    women: 'Ženske',
    unisex: 'Unisex',
    sortBy: 'Razvrsti po',
    priceAsc: 'Cena: Od Najnižje',
    priceDesc: 'Cena: Od Najvišje',
    nameAsc: 'Ime: A-Ž',
    nameDesc: 'Ime: Ž-A',
    viewDetails: 'Poglej Podrobnosti',
    inStock: 'Na Zalogi',
    outOfStock: 'Ni na Zalogi',
    page: 'Stran',
    of: 'od',
    previous: 'Prejšnja',
    next: 'Naslednja',
    
    // Product Details
    description: 'Opis',
    fragranceNotes: 'Dišavne Note',
    availability: 'Dostopnost',
    category: 'Kategorija',
    reviews: 'Ocene',
    
    // Cart
    shoppingCart: 'Nakupovalna Košarica',
    emptyCart: 'Vaša košarica je prazna',
    continueShopping: 'Nadaljuj z Nakupovanjem',
    quantity: 'Količina',
    price: 'Cena',
    total: 'Skupaj',
    remove: 'Odstrani',
    proceedToCheckout: 'Pojdi na Blagajno',
    subtotal: 'Vmesna Vsota',
    shipping: 'Dostava',
    calculated: 'Izračunano pri blagajni',
    
    // Checkout & Payment
    checkout: 'Blagajna',
    paymentSuccess: 'Plačilo Uspešno',
    orderConfirmed: 'Vaše naročilo je bilo potrjeno!',
    orderNumber: 'Številka Naročila',
    thankYou: 'Hvala za vaš nakup',
    continueBrowsing: 'Nadaljuj z Brskanjem',
    
    // Auth
    email: 'Email',
    password: 'Geslo',
    firstName: 'Ime',
    lastName: 'Priimek',
    confirmPassword: 'Potrdi Geslo',
    rememberMe: 'Zapomni si me',
    forgotPassword: 'Pozabljeno geslo?',
    noAccount: 'Nimaš računa?',
    signUp: 'Registriraj Se',
    haveAccount: 'Imaš že račun?',
    signIn: 'Prijavi Se',
    
    // Admin
    users: 'Uporabniki',
    orders: 'Naročila',
    adminProducts: 'Izdelki',
    dashboard: 'Nadzorna Plošča',
    totalUsers: 'Skupaj Uporabnikov',
    activeUsers: 'Aktivni Uporabniki',
    totalRevenue: 'Skupni Prihodki',
    ordersToday: 'Naročila Danes',
    userManagement: 'Upravljanje Uporabnikov',
    orderManagement: 'Upravljanje Naročil',
    productManagement: 'Upravljanje Izdelkov',
    addProduct: 'Dodaj Izdelek',
    name: 'Ime',
    brand: 'Blagovna Znamka',
    stock: 'Zaloga',
    actions: 'Dejanja',
    status: 'Status',
    date: 'Datum',
    customer: 'Stranka',
    amount: 'Znesek',
    role: 'Vloga',
    joined: 'Pridružen',
    orderId: 'ID Naročila',
    orderDetails: 'Podrobnosti Naročila',
    customerDetails: 'Podatki Stranke',
    orderStatus: 'Status Naročila',
    orderItems: 'Naročeni Izdelki',
    product: 'Izdelek',
    
    // Actions
    view: 'Poglej',
    edit: 'Uredi',
    delete: 'Izbriši',
    save: 'Shrani',
    cancel: 'Prekliči',
    back: 'Nazaj',
    search: 'Iskanje',
    confirm: 'Potrdi',
    close: 'Zapri',
    update: 'Posodobi',
    
    // Status
    pending: 'V Čakanju',
    processing: 'V Obdelavi',
    completed: 'Zaključeno',
    cancelled: 'Preklicano',
    active: 'Aktiven',
    inactive: 'Neaktiven',
    admin: 'Administrator',
    moderator: 'Moderator',
    user: 'Uporabnik',
    
    // Messages
    addedToCart: 'Dodano v košarico',
    removedFromCart: 'Odstranjeno iz košarice',
    orderPlaced: 'Naročilo uspešno oddano',
    error: 'Prišlo je do napake',
    success: 'Uspeh',
    deleteConfirm: 'Ali ste prepričani, da želite izbrisati ta element?',
    actionCannotBeUndone: 'Tega dejanja ni mogoče razveljaviti.',
    
    // Footer
    aboutUs: 'O Nas',
    contactUs: 'Kontaktirajte Nas',
    privacyPolicy: 'Politika Zasebnosti',
    termsOfService: 'Pogoji Uporabe',
    allRightsReserved: 'Vse pravice pridržane',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'sl' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

