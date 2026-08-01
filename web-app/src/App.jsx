import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import {
  BookOpen,
  ShieldCheck,
  LogOut,
  LogIn,
  PlusCircle,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Layers,
  Info,
  CheckCircle2,
  ReceiptText,
  Book,
  ShoppingBag,
  Image as ImageIcon,
  Edit,
  Bookmark,
  Lightbulb,
  Signpost,
  Home,
  LayoutGrid,
  Bell,
  User,
  ArrowLeft,
  Calculator,
  Printer,
  Zap,
  FileText,
  Palette,
  Layers3,
  Check,
  MoreVertical,
  Sliders,
  Settings,
  X,
  Save,
  RotateCcw
} from 'lucide-react';

const DEFAULT_SIZES = [
  { name: 'A4 size', tag: 'Standard Large', multiple: 1 },
  { name: 'A5 size', tag: 'Half A4', multiple: 2 },
  { name: 'A6 size', tag: 'Pocket Book', multiple: 4 },
  { name: 'A4/3 size', tag: '3-on-1 Leaf', multiple: 3 },
  { name: 'A4/4 size', tag: '4-on-1 Leaf', multiple: 4 },
];

const PRINTING_METHODS = [
  {
    id: 'offset',
    name: 'Offset Printing',
    tag: 'High Quality / Commercial',
    desc: 'Best for crisp, professional finish & standard bill books',
    icon: Printer,
    color: '#0D9488'
  },
  {
    id: 'duplo',
    name: 'Duplo Printing',
    tag: 'Fast & Economical',
    desc: 'Ideal for quick digital duplicator invoice & receipt runs',
    icon: Zap,
    color: '#4F46E5'
  }
];

const DEFAULT_PAPERS = [
  { name: 'NCR Carbonized Paper', tag: 'CB / CFB / CF', desc: 'Carbonized set' },
  { name: 'Bank Paper 60 GSM', tag: 'Standard Sheet', desc: 'Standard ledger sheet' },
  { name: 'Bond Paper 80 GSM', tag: 'Premium Heavy', desc: 'High-end letterhead feel' },
  { name: 'Normal Print 50 GSM', tag: 'Economical', desc: 'Quick receipt sheet' },
];

const OFFSET_COLOR_OPTIONS = [
  { id: 1, label: '1 Color' },
  { id: 2, label: '2 Colors' },
  { id: 3, label: '3 Colors' },
  { id: 4, label: '4 Colors' },
];

const ADMIN_EMAILS = [
  '97drag0nrider@gmail.com',
  'sanjeewa97@gmail.com',
  'printestimator.dev@gmail.com'
];

export default function App() {
  // Navigation State ('home' or 'bill_book')
  const [currentScreen, setCurrentScreen] = useState('home');
  const [activeNavTab, setActiveNavTab] = useState(0);

  // Auth state
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Bill Book Estimator Form State
  const [customSizes, setCustomSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState('A4 size');
  const [printingMethod, setPrintingMethod] = useState('Offset Printing'); // 'Offset Printing' or 'Duplo Printing'
  const [quantity, setQuantity] = useState(10);
  const [pageQuantity, setPageQuantity] = useState(50);

  // Step 4: Paper Layers & Colors State (Top, Mid 1, Mid 2, Mid 3, Bottom)
  const [customPapers, setCustomPapers] = useState([]);
  const [paperLayers, setPaperLayers] = useState({
    top: { enabled: true, paper: 'NCR Carbonized Paper', color: 1 },
    mid1: { enabled: false, paper: 'NCR Carbonized Paper', color: 1 },
    mid2: { enabled: false, paper: 'NCR Carbonized Paper', color: 1 },
    mid3: { enabled: false, paper: 'NCR Carbonized Paper', color: 1 },
    bottom: { enabled: true, paper: 'NCR Carbonized Paper', color: 1 },
  });

  // Modal State for Add Custom Size or Custom Paper
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('size'); // 'size' or 'paper'
  const [newInputText, setNewInputText] = useState('');
  const [notification, setNotification] = useState(null);

  // Step 4: Advanced Pricing & Cost Settings (9 Options Requested by User)
  const getInitialAdvancedSettings = () => {
    const saved = localStorage.getItem('custom_bill_book_advanced_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved advanced settings:', e);
      }
    }
    return {
      profitPercentage: 40,
      wastagePercentage: 15,
      paperPrices: {
        'NCR Carbonized Paper': 3.50,
        'Bank Paper': 3.00,
        'Art Paper 120g': 5.00,
        'Art Paper 150g': 6.50,
        'Art Board 230g': 10.00,
        'Art Board 300g': 12.00,
        'Bond Paper 80g': 4.00,
        'Ledger Paper': 4.50,
        'Manifold Paper': 2.50,
        'Choose paper type': 3.00,
      },
      platePrice: 1300,
      impressionCost: 1000,
      duploCost: 3.5,
      bindingChargesPerBook: 80,
      transportCharges: 500,
      additionalChargeName: '',
      additionalChargeAmount: 0.00,
    };
  };

  const [advancedSettings, setAdvancedSettings] = useState(getInitialAdvancedSettings);
  const [selectedPaperForPrice, setSelectedPaperForPrice] = useState('NCR Carbonized Paper');
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);

  // Global layout selection for Offset Printing: 'A4' or '2up' — applies to ALL layers
  const [offsetLayout, setOffsetLayout] = useState('2up');

  const updateAdvancedSetting = (field, value) => {
    setAdvancedSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updatePaperPrice = (paperName, newPrice) => {
    setAdvancedSettings(prev => ({
      ...prev,
      paperPrices: {
        ...prev.paperPrices,
        [paperName]: Number(newPrice) || 0
      }
    }));
  };

  // Calculator Dialog State for other 7 items
  const [calcModalItem, setCalcModalItem] = useState(null);
  const [calcQty, setCalcQty] = useState('10');
  const [calcCost, setCalcCost] = useState('');
  const [calcPrice, setCalcPrice] = useState('');
  const [itemDefaults, setItemDefaults] = useState({});

  // Load user auth & custom items from localStorage
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const email = currentUser?.email?.toLowerCase().trim() ?? '';
      setIsAdmin(ADMIN_EMAILS.includes(email));
    });

    // Load custom sizes
    const savedSizes = localStorage.getItem('custom_bill_book_sizes');
    if (savedSizes) {
      try {
        setCustomSizes(JSON.parse(savedSizes));
      } catch (e) {
        console.error('Failed to parse saved custom sizes', e);
      }
    }

    // Load custom papers
    const savedPapers = localStorage.getItem('custom_top_papers');
    if (savedPapers) {
      try {
        setCustomPapers(JSON.parse(savedPapers));
      } catch (e) {
        console.error('Failed to parse saved top papers', e);
      }
    }

    // Load calculator item defaults
    const savedDefaults = localStorage.getItem('printing_item_defaults');
    if (savedDefaults) {
      try {
        setItemDefaults(JSON.parse(savedDefaults));
      } catch (e) {
        console.error('Failed to parse item defaults', e);
      }
    }

    return () => unsubscribe();
  }, []);

  const showToast = (text) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('Signed in successfully!');
    } catch (error) {
      console.error('Sign-in failed', error);
      showToast('Sign in failed. Check console for details.');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    showToast('Signed out.');
  };

  // Printing multiple rule
  const getRequiredMultiple = (sizeName) => {
    const lower = sizeName.toLowerCase().trim();
    if (lower === 'a4 size' || lower === 'a4') return 1;
    if (lower === 'a5 size' || lower === 'a5') return 2;
    if (lower === 'a6 size' || lower === 'a6') return 4;
    if (lower === 'a4/3 size' || lower === 'a4/3' || lower.includes('a4/3')) return 3;
    if (lower === 'a4/4 size' || lower === 'a4/4' || lower.includes('a4/4')) return 4;
    return 1;
  };

  const getDefaultQuantity = (multiple) => {
    switch (multiple) {
      case 1: return 10;
      case 2: return 10;
      case 3: return 12;
      case 4: return 20;
      default: return multiple * 5;
    }
  };

  const getQuantityDropdownOptions = (multiple) => {
    switch (multiple) {
      case 1: return [1, 2, 5, 10, 15, 20, 25, 50, 100, 200];
      case 2: return [2, 4, 6, 8, 10, 12, 20, 30, 50, 100];
      case 3: return [3, 6, 9, 12, 15, 30, 60, 90, 120];
      case 4: return [4, 8, 12, 16, 20, 40, 60, 80, 100];
      default: return [
        multiple,
        multiple * 2,
        multiple * 5,
        multiple * 10,
        multiple * 20,
        multiple * 50
      ];
    }
  };

  const handleSizeClick = (newSize) => {
    const newMultiple = getRequiredMultiple(newSize);
    setSelectedSize(newSize);
    if (quantity % newMultiple !== 0 || quantity < newMultiple) {
      setQuantity(getDefaultQuantity(newMultiple));
    }
  };

  const handleResetAll = () => {
    setSelectedSize('A4 size');
    setPrintingMethod('Offset Printing');
    setQuantity(10);
    setPageQuantity(50);
    setPaperLayers({
      top: { enabled: true, paper: 'NCR Carbonized Paper', color: 1 },
      mid1: { enabled: false, paper: 'NCR Carbonized Paper', color: 1 },
      mid2: { enabled: false, paper: 'NCR Carbonized Paper', color: 1 },
      mid3: { enabled: false, paper: 'NCR Carbonized Paper', color: 1 },
      bottom: { enabled: true, paper: 'NCR Carbonized Paper', color: 1 },
    });
    setAdvancedSettings(getInitialAdvancedSettings());
    showToast('Reset all specifications to default');
  };

  const handleAddCustomOption = (e) => {
    e.preventDefault();
    const trimmed = newInputText.trim();
    if (!trimmed) return;

    if (modalType === 'size') {
      const exists = DEFAULT_SIZES.some(s => s.name === trimmed) || customSizes.includes(trimmed);
      if (exists) {
        showToast(`"${trimmed}" is already in the sizes list!`);
        return;
      }
      const updated = [...customSizes, trimmed];
      setCustomSizes(updated);
      localStorage.setItem('custom_bill_book_sizes', JSON.stringify(updated));
      handleSizeClick(trimmed);
      showToast(`Added and selected "${trimmed}"`);
    } else {
      // modalType === 'paper'
      const exists = DEFAULT_PAPERS.some(p => p.name === trimmed) || customPapers.includes(trimmed);
      if (exists) {
        showToast(`"${trimmed}" is already in the paper list!`);
        return;
      }
      const updated = [...customPapers, trimmed];
      setCustomPapers(updated);
      localStorage.setItem('custom_top_papers', JSON.stringify(updated));
      showToast(`Added paper option "${trimmed}"`);
    }

    setNewInputText('');
    setShowAddModal(false);
  };

  const handleDeleteCustomSize = (sizeToDelete, e) => {
    if (e) e.stopPropagation();
    const updated = customSizes.filter((s) => s !== sizeToDelete);
    setCustomSizes(updated);
    localStorage.setItem('custom_bill_book_sizes', JSON.stringify(updated));
    if (selectedSize === sizeToDelete) {
      handleSizeClick(DEFAULT_SIZES[0].name);
    }
    showToast(`Removed "${sizeToDelete}"`);
  };

  const handleDeleteCustomPaper = (paperToDelete, e) => {
    if (e) e.stopPropagation();
    const updated = customPapers.filter((p) => p !== paperToDelete);
    setCustomPapers(updated);
    localStorage.setItem('custom_top_papers', JSON.stringify(updated));
    showToast(`Removed "${paperToDelete}"`);
  };

  // Update a specific layer's paper, color, or enabled
  const updateLayer = (layerKey, field, value) => {
    if (layerKey === 'top' && field === 'paper') {
      if (value === 'NCR Carbonized Paper') {
        setPaperLayers(prev => ({
          top: { ...prev.top, paper: 'NCR Carbonized Paper' },
          mid1: { ...prev.mid1, paper: 'NCR Carbonized Paper' },
          mid2: { ...prev.mid2, paper: 'NCR Carbonized Paper' },
          mid3: { ...prev.mid3, paper: 'NCR Carbonized Paper' },
          bottom: { ...prev.bottom, paper: 'NCR Carbonized Paper' },
        }));
        showToast('All sheets locked to NCR Carbonized Paper');
        return;
      } else {
        setPaperLayers(prev => {
          const sanitizePaper = (currentPaper) =>
            currentPaper === 'NCR Carbonized Paper' ? (value === 'Choose paper type' ? 'Choose paper type' : value) : currentPaper;
          return {
            ...prev,
            top: { ...prev.top, paper: value },
            mid1: { ...prev.mid1, paper: sanitizePaper(prev.mid1.paper) },
            mid2: { ...prev.mid2, paper: sanitizePaper(prev.mid2.paper) },
            mid3: { ...prev.mid3, paper: sanitizePaper(prev.mid3.paper) },
            bottom: { ...prev.bottom, paper: sanitizePaper(prev.bottom.paper) },
          };
        });
        return;
      }
    }

    setPaperLayers(prev => ({
      ...prev,
      [layerKey]: {
        ...prev[layerKey],
        [field]: value
      }
    }));
  };

  // Open Calculator Dialog for an item
  const handleOpenCalculator = (itemName) => {
    const defaults = itemDefaults[itemName] || { cost: '', price: '' };
    setCalcQty('10');
    setCalcCost(defaults.cost !== '' ? String(defaults.cost) : '');
    setCalcPrice(defaults.price !== '' ? String(defaults.price) : '');
    setCalcModalItem(itemName);
  };

  const handleSaveItemDefaults = () => {
    if (!calcModalItem) return;
    const updated = {
      ...itemDefaults,
      [calcModalItem]: {
        cost: calcCost ? Number(calcCost) : 0,
        price: calcPrice ? Number(calcPrice) : 0
      }
    };
    setItemDefaults(updated);
    localStorage.setItem('printing_item_defaults', JSON.stringify(updated));
    showToast(`Saved defaults for ${calcModalItem}`);
  };

  const allSizesList = [
    ...DEFAULT_SIZES,
    ...customSizes.map(name => ({ name, tag: 'Custom Size', multiple: getRequiredMultiple(name) }))
  ];

  const allPaperOptions = [
    'Choose paper type',
    ...DEFAULT_PAPERS.map(p => p.name),
    ...customPapers
  ];

  const requiredMultiple = getRequiredMultiple(selectedSize);
  const quantityOptions = getQuantityDropdownOptions(requiredMultiple);
  const finalQuantityOptions = quantityOptions.includes(quantity)
    ? quantityOptions
    : [...quantityOptions, quantity].sort((a, b) => a - b);

  // Calculate numbers for dialog
  const numQty = parseFloat(calcQty) || 0;
  const numCost = parseFloat(calcCost) || 0;
  const numPrice = parseFloat(calcPrice) || 0;
  const totalCost = numQty * numCost;
  const totalRevenue = numQty * numPrice;
  const profit = totalRevenue - totalCost;

  // 8 Homepage Menu Items (Matching Flutter app colors & icons)
  const menuItems = [
    { name: 'Bill Book', icon: ReceiptText, color: '#F97316', isBillBook: true },
    { name: 'Pad Book', icon: Book, color: '#4F46E5' },
    { name: 'Poly Bag\nPrint', icon: ShoppingBag, color: '#9333EA' },
    { name: 'Photo Frame', icon: ImageIcon, color: '#0D9488' },
    { name: 'Customize\nFrame', icon: Edit, color: '#EC4899' },
    { name: 'Name Board', icon: Bookmark, color: '#9A3412' },
    { name: 'Light Board', icon: Lightbulb, color: '#D97706' },
    { name: 'Stand Board', icon: Signpost, color: '#64748B' },
  ];

  // Helper calculation for how many sheets are active in the set
  const activeCount = Object.values(paperLayers).filter(l => l.enabled).length;
  const plyLabel = activeCount === 1 ? '1-Ply' : `${activeCount}-Ply Set`;

  // Layer metadata for display
  const layersConfig = [
    { key: 'top', title: 'TOP PAPER', subtitle: '1st Leaf (Original)', badgeColor: '#fef3c7', badgeText: '#d97706' },
    { key: 'mid1', title: 'MID 1 PAPER', subtitle: '2nd Leaf (Duplicate)', badgeColor: '#e0e7ff', badgeText: '#4338ca' },
    { key: 'mid2', title: 'MID 2 PAPER', subtitle: '3rd Leaf (Triplicate)', badgeColor: '#f3e8ff', badgeText: '#7e22ce' },
    { key: 'mid3', title: 'MID 3 PAPER', subtitle: '4th Leaf (Quadruplicate)', badgeColor: '#fce7f3', badgeText: '#be185d' },
    { key: 'bottom', title: 'BOTTOM PAPER', subtitle: 'Final Leaf (Last Copy)', badgeColor: '#ecfdf5', badgeText: '#047857' },
  ];

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#1e293b',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '99px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem',
          fontWeight: 700
        }}>
          <CheckCircle2 size={18} color="#0D9488" />
          {notification}
        </div>
      )}

      {/* SCREEN 1: HOMEPAGE WITH 8 ICONS GRID */}
      {currentScreen === 'home' && (
        <>
          {/* Header Bar */}
          <header className="home-header">
            <div>
              <div className="welcome-label">Welcome back,</div>
              <h1 className="shop-name">Printing Shop Name</h1>
            </div>

            <div className="header-actions">
              {isAdmin && (
                <span className="admin-badge">
                  <ShieldCheck size={14} />
                  OWNER
                </span>
              )}
              {user ? (
                <button onClick={handleSignOut} className="btn-signout" title="Sign Out">
                  <LogOut size={18} />
                </button>
              ) : (
                <button onClick={handleGoogleSignIn} className="btn-signin">
                  <LogIn size={16} />
                  <span>Owner Login</span>
                </button>
              )}
            </div>
          </header>

          {/* Owner Banner Alert */}
          {isAdmin && (
            <div className="owner-banner">
              <ShieldCheck size={16} />
              <span>OWNER MODE ACTIVE: You have admin privileges for all estimator defaults.</span>
            </div>
          )}

          {/* Homepage Grid of 8 Colorful Icons */}
          <main className="home-grid-container">
            <div className="home-grid">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.name}
                    className="menu-card"
                    onClick={() => {
                      if (item.isBillBook) {
                        setCurrentScreen('bill_book');
                      } else {
                        handleOpenCalculator(item.name.replace('\n', ' '));
                      }
                    }}
                  >
                    <div
                      className="icon-circle"
                      style={{
                        backgroundColor: `${item.color}18`, // 15% opacity tint
                        color: item.color
                      }}
                    >
                      <IconComponent size={28} />
                    </div>
                    <span className="menu-label">
                      {item.name.split('\n').map((line, idx) => (
                        <React.Fragment key={idx}>
                          {line}
                          {idx < item.name.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </span>
                  </div>
                );
              })}
            </div>
          </main>
        </>
      )}

      {/* SCREEN 2: BILL BOOK ESTIMATOR SCREEN */}
      {currentScreen === 'bill_book' && (
        <>
          {/* Subscreen Top Bar (Matching User Screenshot Top Navbar!) */}
          <div className="subscreen-navbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setCurrentScreen('home')}
                className="btn-back-nav"
                title="Back to Homepage"
              >
                <ArrowLeft size={20} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ReceiptText size={24} color="#ffffff" />
                <h1 className="subscreen-nav-title">Bill / Invoice Price Calculator</h1>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button className="btn-nav-action" onClick={() => handleResetAll()}>
                <Plus size={16} />
                <span>New Bill</span>
              </button>
              <button className="btn-nav-action-more" onClick={() => showToast('More Options')}>
                <MoreVertical size={16} />
                <span>More</span>
              </button>
            </div>
          </div>

          {/* Owner Banner */}
          {isAdmin && (
            <div className="owner-banner" style={{ margin: '0.5rem auto 1rem' }}>
              <ShieldCheck size={16} />
              <span>OWNER MODE ACTIVE: You can add or remove custom sizes and paper types below.</span>
            </div>
          )}

          {/* Calculate pricing & breakdown matching user screenshot */}
          {(() => {
            const enabledLayersList = layersConfig.filter(l => paperLayers[l.key].enabled);
            const totalPagesPerBook = enabledLayersList.length * pageQuantity;
            const totalPrintedSheets = totalPagesPerBook * quantity;

            // 1) Paper Cost (based on selected paper types for enabled layers)
            const costPerSetPaper = enabledLayersList.reduce((sum, layer) => {
              const pName = paperLayers[layer.key].paper;
              const unitPrice = advancedSettings.paperPrices[pName] !== undefined
                ? advancedSettings.paperPrices[pName]
                : 3.50;
              return sum + unitPrice;
            }, 0);
            const totalRawPaperCost = quantity * pageQuantity * costPerSetPaper;
            const totalWastageCost = totalRawPaperCost * ((Number(advancedSettings.wastagePercentage) || 0) / 100);
            const totalPaperCostWithWastage = totalRawPaperCost + totalWastageCost;
            const basePaperCostPerSheet = totalPrintedSheets > 0 ? totalPaperCostWithWastage / totalPrintedSheets : 0;

            // 2) Printing / Impression / Duplo Cost
            const totalPrintingCost = printingMethod === 'Offset Printing'
              ? Math.max(1, Math.ceil(totalPrintedSheets / 1000)) * (Number(advancedSettings.impressionCost) || 0)
              : totalPrintedSheets * (Number(advancedSettings.duploCost) || 0);
            const basePrintCostPerSheet = totalPrintedSheets > 0 ? totalPrintingCost / totalPrintedSheets : 0;

            // 3) Plate Price
            const totalPlateCost = printingMethod === 'Offset Printing'
              ? (Number(advancedSettings.platePrice) || 0)
              : 0;

            // 4) Binding, Transport, Additional
            const totalBindingCost = quantity * (Number(advancedSettings.bindingChargesPerBook) || 0);
            const totalTransportCost = Number(advancedSettings.transportCharges) || 0;
            const totalAdditionalCost = Number(advancedSettings.additionalChargeAmount) || 0;

            // Subtotal (Base Production Cost) and Profit
            const totalBaseCost = totalPaperCostWithWastage + totalPrintingCost + totalPlateCost + totalBindingCost + totalTransportCost + totalAdditionalCost;
            const totalProfitAmount = totalBaseCost * ((Number(advancedSettings.profitPercentage) || 0) / 100);
            const estimatedTotal = totalBaseCost + totalProfitAmount;


            return (
              <main className="app-content-2col">
                {/* LEFT COLUMN: SPECS & OPTIONS CARDS */}
                <div className="left-column-cards">
                  {/* 1. Book Size Card */}
                  {/* 1. Paper Size, Book Quantity & Page Quantity (3-Column Row) */}
                  <div className="card-ribbon-card">
                    <div className="card-header-ribbon purple">
                      <span>1. PAPER SIZE, QUANTITY & PAGES</span>
                      <Layers size={18} />
                    </div>
                    <div className="card-body-padded">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', alignItems: 'flex-start' }}>
                        {/* Column 1: Paper Size */}
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>PAPER SIZE</span>
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  setModalType('size');
                                  setNewInputText('');
                                  setShowAddModal(true);
                                }}
                                style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}
                              >
                                <PlusCircle size={13} />
                                <span>+ Custom</span>
                              </button>
                            )}
                          </div>
                          <select
                            value={selectedSize}
                            onChange={(e) => handleSizeClick(e.target.value)}
                            className="form-select"
                            style={{ width: '100%', fontSize: '0.88rem', padding: '0.45rem 0.65rem' }}
                          >
                            {allSizesList.map((item) => (
                              <option key={item.name} value={item.name}>
                                {item.name} — {item.tag} ({item.multiple === 1 ? 'Any Qty' : `${item.multiple}x Multiples`})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Column 2: Quantity (Books) */}
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>QUANTITY (BOOKS)</span>
                            <span style={{ fontSize: '0.7rem', color: '#0d9488', fontWeight: 600 }}>{requiredMultiple}x Step</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                            <select
                              value={quantity}
                              onChange={(e) => setQuantity(Number(e.target.value))}
                              className="form-select"
                              style={{ flex: 1, fontSize: '0.88rem', padding: '0.45rem 0.65rem' }}
                            >
                              {finalQuantityOptions.map((qty) => (
                                <option key={qty} value={qty}>
                                  {qty} Books
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => quantity > requiredMultiple && setQuantity(quantity - requiredMultiple)}
                              disabled={quantity <= requiredMultiple}
                              className="stepper-btn"
                              style={{ width: '34px', height: '34px', flexShrink: 0 }}
                              title="Decrease Quantity"
                            >
                              <Minus size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuantity(quantity + requiredMultiple)}
                              className="stepper-btn"
                              style={{ width: '34px', height: '34px', flexShrink: 0 }}
                              title="Increase Quantity"
                            >
                              <Plus size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Column 3: Page Quantity (Pages per Book) */}
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.35rem' }}>
                            <span>PAGE QUANTITY (PER BOOK)</span>
                          </div>
                          <select
                            value={pageQuantity}
                            onChange={(e) => setPageQuantity(Number(e.target.value))}
                            className="form-select"
                            style={{ width: '100%', fontSize: '0.88rem', padding: '0.45rem 0.65rem' }}
                          >
                            {[25, 50, 75, 100, 150, 200].map((pq) => (
                              <option key={pq} value={pq}>
                                {pq} Pages / Sets {pq === 50 ? '(Standard)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Printing Method Card (Compact Button Row - No scrolling!) */}
                  <div className="card-ribbon-card">
                    <div className="card-header-ribbon blue">
                      <span>2. PRINTING METHOD</span>
                      <Printer size={18} />
                    </div>
                    <div className="card-body-padded">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                        {PRINTING_METHODS.map((method) => {
                          const isSelected = printingMethod === method.name;
                          const IconComp = method.icon;
                          return (
                            <div
                              key={method.id}
                              onClick={() => setPrintingMethod(method.name)}
                              style={{
                                background: isSelected ? '#eef2ff' : '#f8fafc',
                                border: '2px solid',
                                borderColor: isSelected ? '#6366f1' : '#e2e8f0',
                                borderRadius: '10px',
                                padding: '0.5rem 0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.15)' : 'none'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <IconComp size={18} color={isSelected ? '#6366f1' : '#64748b'} />
                                <div>
                                  <div style={{ fontFamily: 'Outfit', fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                                    {method.name}
                                  </div>
                                  <div style={{ fontSize: '0.73rem', color: '#64748b' }}>
                                    {method.tag}
                                  </div>
                                </div>
                              </div>
                              {isSelected && <CheckCircle2 size={16} color="#6366f1" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 3. Number of Sheets & Printing Color (Now Card 3!) */}
                  <div className="card-ribbon-card">
                    <div className="card-header-ribbon pink">
                      <span>3. NUMBER OF SHEETS & PRINTING COLOR</span>
                      <Layers3 size={18} />
                    </div>
                    <div className="card-body-padded" style={{ padding: '0.45rem 0.65rem' }}>

              {/* Informative notice for Duplo vs Offset */}
              {printingMethod === 'Duplo Printing' && (
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  padding: '0.22rem 0.55rem',
                  borderRadius: '7px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '0.35rem'
                }}>
                  <Info size={14} color="#2563eb" />
                  <span>Duplo Duplicator printing uses standard Single Color print.</span>
                </div>
              )}

              {/* Informative notice for NCR restriction */}
              {paperLayers.top.paper === 'NCR Carbonized Paper' && (
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  padding: '0.22rem 0.55rem',
                  borderRadius: '7px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '0.35rem'
                }}>
                  <Info size={14} color="#d97706" />
                  <span>NCR Rule: Since Top Paper is NCR Carbonized, other sheets are locked to NCR Carbonized Paper.</span>
                </div>
              )}

              {paperLayers.top.paper !== 'NCR Carbonized Paper' && paperLayers.top.paper !== 'Choose paper type' && (
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1e3a8a',
                  padding: '0.22rem 0.55rem',
                  borderRadius: '7px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '0.35rem'
                }}>
                  <Info size={14} color="#2563eb" />
                  <span>Printing Rule: Since Top Paper is not NCR Carbonized, other sheets cannot be selected as NCR Carbonized.</span>
                </div>
              )}

              {/* 5 Layer Sheets List Table: Top, Mid 1, Mid 2, Mid 3, Bottom */}
              <div className="paper-list-container">
                {/* Table Header Bar */}
                <div
                  className="paper-list-header-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: printingMethod === 'Offset Printing'
                      ? 'minmax(130px, 1fr) 1fr 110px 72px 72px'
                      : 'minmax(150px, 1fr) 1fr 125px',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span style={{ textAlign: 'left' }}>Sheet Layer</span>
                  <span style={{ textAlign: 'center' }}>Paper Type</span>
                  <span style={{ textAlign: 'right' }}>Printing Color</span>
                  {printingMethod === 'Offset Printing' && (
                    <>
                      <span style={{ textAlign: 'center', fontSize: '0.68rem', color: '#0369a1', fontWeight: 800 }}>A4/2up</span>
                      <span style={{ textAlign: 'center', fontSize: '0.68rem', color: '#7e22ce', fontWeight: 800 }}>Full Sheet</span>
                    </>
                  )}
                </div>

                {layersConfig.map((layer) => {
                  const currentData = paperLayers[layer.key];
                  const isOptional = layer.key === 'mid1' || layer.key === 'mid2' || layer.key === 'mid3';
                  const isEnabled = currentData.enabled;
                  const isTopNcr = paperLayers.top.paper === 'NCR Carbonized Paper';
                  const layerPaperOptions = layer.key === 'top'
                    ? allPaperOptions
                    : (isTopNcr
                      ? ['NCR Carbonized Paper']
                      : allPaperOptions.filter(p => p !== 'NCR Carbonized Paper'));

                  // Layer-specific display label for NCR Carbonized Paper
                  const getNcrLabel = (paperName) => {
                    if (paperName !== 'NCR Carbonized Paper') return paperName;
                    if (layer.key === 'top') return 'NCR top';
                    if (layer.key === 'bottom') return 'NCR bot';
                    return 'NCR mid'; // mid1, mid2, mid3
                  };

                  // Offset printing sheet calculations per layer (uses global offsetLayout)
                  const layoutDivisor = offsetLayout === 'A4' ? 1 : 2;
                  const layerTotalSheets = isEnabled ? (pageQuantity * quantity) : 0;
                  const layerA4TwoUp = isEnabled ? Math.ceil(layerTotalSheets / layoutDivisor) : 0;
                  // Full sheet is ALWAYS calculated from A4 sheet count / 8 (same whether A4 or 2up)
                  const layerFullSheets = isEnabled ? Math.ceil(layerTotalSheets / 8) : 0;

                  return (
                    <div
                      key={layer.key}
                      className="paper-list-row"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: printingMethod === 'Offset Printing'
                          ? 'minmax(130px, 1fr) 1fr 110px 72px 72px'
                          : 'minmax(150px, 1fr) 1fr 125px',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: !isEnabled ? 0.65 : 1,
                        backgroundColor: !isEnabled ? '#f8fafc' : '#ffffff'
                      }}
                    >
                      {/* Left Side: Layer Title & Subtitle with Checkbox for Optional Sheets */}
                      <div className="paper-list-label" style={{ textAlign: 'left' }}>
                        {isOptional ? (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => updateLayer(layer.key, 'enabled', e.target.checked)}
                              style={{ width: '16px', height: '16px', accentColor: '#0d9488', cursor: 'pointer' }}
                            />
                            <div>
                              <div className="paper-list-title" style={{ margin: 0 }}>
                                <FileText size={15} color={isEnabled ? layer.badgeText : '#94a3b8'} />
                                <span style={{ color: isEnabled ? '#0f172a' : '#64748b' }}>{layer.title}</span>
                              </div>
                              <span
                                className="paper-list-subtitle"
                                style={{ color: isEnabled ? layer.badgeText : '#94a3b8' }}
                              >
                                {layer.subtitle}
                              </span>
                            </div>
                          </label>
                        ) : (
                          <>
                            <div className="paper-list-title">
                              <FileText size={15} color={layer.badgeText} />
                              <span>{layer.title}</span>
                            </div>
                            <span
                              className="paper-list-subtitle"
                              style={{ color: layer.badgeText }}
                            >
                              {layer.subtitle}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Middle: Paper Dropdown (Centered in the exact middle!) */}
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {isEnabled && (
                          <select
                            value={currentData.paper}
                            onChange={(e) => updateLayer(layer.key, 'paper', e.target.value)}
                            className="paper-type-select"
                            style={{ margin: '0 auto', textAlign: 'center', textAlignLast: 'center' }}
                          >
                            {layerPaperOptions.map((paperName) => (
                              <option key={paperName} value={paperName}>
                                {getNcrLabel(paperName)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Right Corner: Printing Color Dropdown OR + Include Layer Button */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {!isEnabled ? (
                          <button
                            type="button"
                            onClick={() => updateLayer(layer.key, 'enabled', true)}
                            style={{
                              padding: '0.22rem 0.65rem',
                              borderRadius: '99px',
                              border: '1.5px dashed #cbd5e1',
                              background: '#ffffff',
                              color: '#0d9488',
                              fontSize: '0.73rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>+ Include {layer.title}</span>
                          </button>
                        ) : (
                          <>
                            {printingMethod === 'Offset Printing' && (
                              <select
                                value={currentData.color}
                                onChange={(e) => updateLayer(layer.key, 'color', Number(e.target.value))}
                                className="paper-color-select"
                              >
                                {OFFSET_COLOR_OPTIONS.map((col) => (
                                  <option key={col.id} value={col.id}>
                                    {col.label} ({col.id}C)
                                  </option>
                                ))}
                                {layer.key !== 'top' && (
                                  <option value={0}>Do not print</option>
                                )}
                              </select>
                            )}

                            {printingMethod === 'Duplo Printing' && (
                              layer.key === 'top' ? (
                                <span style={{
                                  width: '115px',
                                  textAlign: 'center',
                                  fontSize: '0.73rem',
                                  fontWeight: 700,
                                  color: '#4338ca',
                                  background: '#e0e7ff',
                                  padding: '0.22rem 0.45rem',
                                  borderRadius: '7px',
                                  display: 'inline-block'
                                }}>
                                  Single Color
                                </span>
                              ) : (
                                <select
                                  value={currentData.color}
                                  onChange={(e) => updateLayer(layer.key, 'color', Number(e.target.value))}
                                  className="paper-color-select"
                                >
                                  <option value={1}>Single Color</option>
                                  <option value={0}>Do not print</option>
                                </select>
                              )
                            )}
                          </>
                        )}
                      </div>

                      {/* A4/2up Column & Full Sheet Column — AFTER Printing Color (Offset only) */}
                      {printingMethod === 'Offset Printing' && (
                        <>
                          {/* A4/2up: Dropdown to select layout, count shown below */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.15rem' }}>
                            {isEnabled ? (
                              <>
                                <select
                                  value={offsetLayout}
                                  onChange={(e) => setOffsetLayout(e.target.value)}
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    color: '#0369a1',
                                    background: '#eff6ff',
                                    border: '1.5px solid #bfdbfe',
                                    borderRadius: '6px',
                                    padding: '0.15rem 0.25rem',
                                    cursor: 'pointer',
                                    width: '58px',
                                    textAlign: 'center',
                                    outline: 'none'
                                  }}
                                >
                                  <option value="A4">A4</option>
                                  <option value="2up">2up</option>
                                </select>
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0369a1' }}>{layerA4TwoUp.toLocaleString()}</span>
                              </>
                            ) : <span style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>—</span>}
                          </div>

                          {/* Full Sheet: Calculated value */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.1rem' }}>
                            {isEnabled ? (
                              <>
                                <span style={{ fontSize: '0.73rem', fontWeight: 800, color: '#7e22ce' }}>{layerFullSheets.toLocaleString()}</span>
                                <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600 }}>full sh.</span>
                              </>
                            ) : <span style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>—</span>}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {/* Offset Printing: Paper Type Totals Summary */}
                {printingMethod === 'Offset Printing' && (() => {
                  const enabledLayers = layersConfig.filter(l => paperLayers[l.key].enabled);
                  if (enabledLayers.length === 0) return null;

                  const layoutDivisorTotal = offsetLayout === 'A4' ? 1 : 2;
                  const totalSheetsPerLeaf = pageQuantity * quantity;
                  const leafA4 = Math.ceil(totalSheetsPerLeaf / layoutDivisorTotal);
                  const leafFs = Math.ceil(totalSheetsPerLeaf / 8);

                  // Case 1: All enabled layers are NCR Carbonized Paper
                  // Show separate totals for NCR top, NCR mid (sum of mid leaves), and NCR bot
                  const allNcr = enabledLayers.every(l => paperLayers[l.key].paper === 'NCR Carbonized Paper');
                  if (allNcr) {
                    const midCount = ['mid1', 'mid2', 'mid3'].filter(k => paperLayers[k].enabled).length;
                    const rows = [];
                    if (paperLayers.top.enabled) {
                      rows.push({ label: 'Total NCR top', a4: leafA4, fs: leafFs });
                    }
                    if (midCount > 0) {
                      rows.push({ label: 'Total NCR mid', a4: leafA4 * midCount, fs: leafFs * midCount });
                    }
                    if (paperLayers.bottom.enabled) {
                      rows.push({ label: 'Total NCR bot', a4: leafA4, fs: leafFs });
                    }
                    if (rows.length === 0) return null;
                    return (
                      <div style={{ marginTop: '0.5rem', borderTop: '1.5px dashed #e2e8f0', paddingTop: '0.4rem' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Total Full Sheets — NCR Carbonized Paper
                        </div>
                        {rows.map(r => (
                          <div key={r.label} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            padding: '0.28rem 0.65rem',
                            marginBottom: '0.22rem'
                          }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d' }}>{r.label}</span>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.7rem', color: '#0369a1', fontWeight: 800 }}>A4/{offsetLayout === 'A4' ? '1up' : '2up'}: {r.a4.toLocaleString()}</span>
                              <span style={{ width: '1px', height: '12px', background: '#bbf7d0' }} />
                              <span style={{ fontSize: '0.7rem', color: '#7e22ce', fontWeight: 800 }}>Full: {r.fs.toLocaleString()} sheets</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  // Case 2: All enabled layers use the exact same non-NCR paper
                  const topPaper = paperLayers.top.paper;
                  const anyMismatch = enabledLayers.some(l => paperLayers[l.key].paper !== topPaper);
                  if (anyMismatch) return null;

                  const totalA4 = leafA4 * enabledLayers.length;
                  const totalFs = leafFs * enabledLayers.length;
                  if (totalA4 === 0) return null;
                  return (
                    <div style={{ marginTop: '0.5rem', borderTop: '1.5px dashed #e2e8f0', paddingTop: '0.4rem' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Total Full Sheets — {topPaper}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '8px',
                        padding: '0.28rem 0.65rem',
                      }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d' }}>Combined Total (Matching Layers)</span>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', color: '#0369a1', fontWeight: 800 }}>A4/{offsetLayout === 'A4' ? '1up' : '2up'}: {totalA4.toLocaleString()}</span>
                          <span style={{ width: '1px', height: '12px', background: '#bbf7d0' }} />
                          <span style={{ fontSize: '0.7rem', color: '#7e22ce', fontWeight: 800 }}>Full: {totalFs.toLocaleString()} sheets</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

                      {/* Owner Admin Controls: Add Custom Paper Type */}
                      {isAdmin && (
                        <div className="admin-actions-bar">
                          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Owner Admin Controls</span>
                          <button
                            onClick={() => {
                              setModalType('paper');
                              setNewInputText('');
                              setShowAddModal(true);
                            }}
                            className="btn-add-size"
                            style={{ background: '#fffbeb', color: '#d97706', borderColor: '#fde68a' }}
                          >
                            <PlusCircle size={15} />
                            <span>+ Add Custom Paper Type</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 4: 4. ADVANCED SETTINGS (Teal Ribbon) */}
                  <div className="card-ribbon-card">
                    <div className="card-header-ribbon teal">
                      <span>4. ADVANCED SETTINGS (PRICING & CHARGES)</span>
                      <Sliders size={18} />
                    </div>
                    <div className="card-body-padded" style={{ padding: '0.45rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                            Profit: {advancedSettings.profitPercentage}%
                          </span>
                          <span style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                            Wastage: {advancedSettings.wastagePercentage}%
                          </span>
                          <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                            Plate: Rs. {advancedSettings.platePrice}
                          </span>
                          <span style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                            {printingMethod === 'Offset Printing' ? `Impr: Rs. ${advancedSettings.impressionCost}/1000` : `Duplo: Rs. ${advancedSettings.duploCost}/sh`}
                          </span>
                          <span style={{ background: '#f3e8ff', border: '1px solid #d8b4fe', color: '#7e22ce', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                            Binding: Rs. {advancedSettings.bindingChargesPerBook}/book
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAdvancedModal(true)}
                          style={{
                            padding: '0.35rem 0.85rem',
                            borderRadius: '8px',
                            background: '#0d9488',
                            color: 'white',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.76rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(13, 148, 136, 0.2)'
                          }}
                        >
                          <Settings size={14} />
                          <span>Configure Costs & Margins</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Buttons (Matching User Screenshot Left Column Bottom!) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                    <button
                      className="btn-action-large blue"
                      onClick={() => showToast(`Calculating Total Price: Rs. ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`)}
                    >
                      <Calculator size={20} />
                      <span>CALCULATE PRICE</span>
                    </button>
                    <button
                      className="btn-action-large red"
                      onClick={() => handleResetAll()}
                    >
                      <Trash2 size={20} />
                      <span>CLEAR ALL</span>
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: SIDEBAR WITH PRICE SUMMARY & PREVIEW (Matching User Screenshot!) */}
                <div className="right-column-sidebar">
                  {/* Card 5: 5. PRICE SUMMARY (Orange Ribbon) */}
                  <div className="card-ribbon-card">
                    <div className="card-header-ribbon orange">
                      <span>5. PRICE SUMMARY</span>
                      <ReceiptText size={18} />
                    </div>
                    <div className="card-body-padded">
                      <div className="summary-spec-list">
                        <div className="summary-spec-row">
                          <span className="summary-spec-label">Selected Size</span>
                          <span className="summary-spec-value">{selectedSize}</span>
                        </div>
                        <div className="summary-spec-row">
                          <span className="summary-spec-label">Quantity (Books)</span>
                          <span className="summary-spec-value">{quantity}</span>
                        </div>
                        <div className="summary-spec-row">
                          <span className="summary-spec-label">Page Qty (per Book)</span>
                          <span className="summary-spec-value">{pageQuantity} Sets</span>
                        </div>
                        <div className="summary-spec-row">
                          <span className="summary-spec-label">Total Pages per Book</span>
                          <span className="summary-spec-value">{totalPagesPerBook}</span>
                        </div>
                        <div className="summary-spec-row">
                          <span className="summary-spec-label">Duplicate Copy</span>
                          <span className="summary-spec-value">Yes ({plyLabel})</span>
                        </div>
                        <div className="summary-spec-row">
                          <span className="summary-spec-label">Total Printed Sheets</span>
                          <span className="summary-spec-value">{totalPrintedSheets.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="summary-section-title">COST BREAKDOWN</div>
                      <div className="summary-spec-list" style={{ marginBottom: 0 }}>
                        <div className="summary-spec-row">
                          <span className="summary-spec-label">Paper Cost (+{advancedSettings.wastagePercentage}% Wastage)</span>
                          <span className="summary-spec-value">Rs. {totalPaperCostWithWastage.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="summary-spec-row">
                          <span className="summary-spec-label">{printingMethod === 'Offset Printing' ? 'Impression Charges' : 'Duplo Printing'}</span>
                          <span className="summary-spec-value">Rs. {totalPrintingCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        {printingMethod === 'Offset Printing' && (
                          <div className="summary-spec-row">
                            <span className="summary-spec-label">Plate Price</span>
                            <span className="summary-spec-value">Rs. {totalPlateCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        <div className="summary-spec-row">
                          <span className="summary-spec-label">Binding Charges</span>
                          <span className="summary-spec-value">Rs. {totalBindingCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="summary-spec-row">
                          <span className="summary-spec-label">Transport Charges</span>
                          <span className="summary-spec-value">Rs. {totalTransportCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        {totalAdditionalCost > 0 && (
                          <div className="summary-spec-row">
                            <span className="summary-spec-label">{advancedSettings.additionalChargeName || 'Additional Charges'}</span>
                            <span className="summary-spec-value">Rs. {totalAdditionalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        <div className="summary-spec-row" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.35rem', marginTop: '0.2rem' }}>
                          <span className="summary-spec-label" style={{ fontWeight: 800, color: '#334155' }}>Subtotal (Production Cost)</span>
                          <span className="summary-spec-value" style={{ fontWeight: 800 }}>Rs. {totalBaseCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="summary-spec-row">
                          <span className="summary-spec-label" style={{ color: '#0d9488' }}>Profit ({advancedSettings.profitPercentage}%)</span>
                          <span className="summary-spec-value" style={{ color: '#0d9488', fontWeight: 800 }}>Rs. {totalProfitAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      {/* Green Highlight Box for Total Price */}
                      <div className="total-price-highlight-box">
                        <span className="total-price-label">TOTAL PRICE</span>
                        <span className="total-price-amount">
                          Rs. {estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Print Preview & Print Buttons inside Price Summary */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginTop: '0.75rem' }}>
                        <button
                          className="btn-preview-action blue"
                          onClick={() => showToast('Opening Print Preview...')}
                          style={{ padding: '0.55rem 0.5rem', fontSize: '0.8rem' }}
                        >
                          <Printer size={15} />
                          <span>PRINT PREVIEW</span>
                        </button>
                        <button
                          className="btn-preview-action green"
                          onClick={() => showToast('Sending Estimate to Printer...')}
                          style={{ padding: '0.55rem 0.5rem', fontSize: '0.8rem' }}
                        >
                          <Check size={15} />
                          <span>PRINT</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            );
          })()}
        </>
      )}

      {/* FLOATING BOTTOM NAVIGATION BAR (Exactly like Android App lines 168-192) */}
      <div className="bottom-navbar-wrapper">
        <nav className="bottom-navbar">
          <div
            className={`nav-pill ${activeNavTab === 0 ? 'active' : ''}`}
            onClick={() => {
              setActiveNavTab(0);
              setCurrentScreen('home');
            }}
          >
            <Home size={22} className="nav-icon" />
            {activeNavTab === 0 && <span>Home</span>}
          </div>

          <div
            className={`nav-pill ${activeNavTab === 1 ? 'active' : ''}`}
            onClick={() => {
              setActiveNavTab(1);
              showToast('Other items view coming soon!');
            }}
          >
            <LayoutGrid size={22} className="nav-icon" />
            {activeNavTab === 1 && <span>Other</span>}
          </div>

          <div
            className={`nav-pill ${activeNavTab === 2 ? 'active' : ''}`}
            onClick={() => {
              setActiveNavTab(2);
              showToast('No new notifications.');
            }}
          >
            <Bell size={22} className="nav-icon" />
            {activeNavTab === 2 && <span>Notification</span>}
          </div>

          <div
            className={`nav-pill ${activeNavTab === 3 ? 'active' : ''}`}
            onClick={() => {
              setActiveNavTab(3);
              if (!user) handleGoogleSignIn();
              else showToast(`Signed in as ${user.email}`);
            }}
          >
            <User size={22} className="nav-icon" />
            {activeNavTab === 3 && <span>Account</span>}
          </div>
        </nav>
      </div>

      {/* CALCULATOR DIALOG MODAL (For Pad Book, Poly Bag, etc. exactly like Android app) */}
      {calcModalItem && (
        <div className="modal-overlay">
          <div className="calc-modal">
            <h3 className="calc-modal-title">
              <Calculator size={22} color="#0D9488" />
              <span>Calculate: {calcModalItem}</span>
            </h3>

            <div className="calc-field-group">
              <label className="calc-label">Quantity</label>
              <input
                type="number"
                value={calcQty}
                onChange={(e) => setCalcQty(e.target.value)}
                className="calc-input"
                placeholder="0"
                autoFocus
              />
            </div>

            <div className="calc-field-group">
              <label className="calc-label">Unit Cost (Rs)</label>
              <input
                type="number"
                value={calcCost}
                onChange={(e) => setCalcCost(e.target.value)}
                className="calc-input"
                placeholder="0.00"
              />
            </div>

            <div className="calc-field-group">
              <label className="calc-label">Unit Selling Price (Rs)</label>
              <input
                type="number"
                value={calcPrice}
                onChange={(e) => setCalcPrice(e.target.value)}
                className="calc-input"
                placeholder="0.00"
              />
            </div>

            {/* Results */}
            <div className="calc-results-card">
              <div className="calc-result-row">
                <span style={{ fontWeight: 700 }}>Selling Price:</span>
                <span className="result-selling">Rs {totalRevenue.toFixed(2)}</span>
              </div>
              <div className="calc-result-row">
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Cost:</span>
                <span className="result-cost">Rs {totalCost.toFixed(2)}</span>
              </div>
              <div className="calc-result-row">
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#16a34a' }}>Profit:</span>
                <span className="result-profit">Rs {profit.toFixed(2)}</span>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleSaveItemDefaults} className="btn-save-defaults">
                Save Defaults
              </button>
              <button onClick={() => setCalcModalItem(null)} className="btn-close">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM BOOK SIZE OR TOP PAPER (Owner Admin Only) */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="calc-modal">
            <h3 className="calc-modal-title">
              <PlusCircle size={22} color={modalType === 'size' ? '#0D9488' : '#D97706'} />
              <span>
                {modalType === 'size' ? 'Add Custom Book Size' : 'Add Custom Paper Type'}
              </span>
            </h3>

            {modalType === 'size' && customSizes.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', maxHeight: '150px', overflowY: 'auto' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Existing Custom Sizes:</div>
                {customSizes.map((size) => (
                  <div key={size} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#f8fafc', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
                    <span>{size}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustomSize(size, e)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {modalType === 'paper' && customPapers.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', maxHeight: '150px', overflowY: 'auto' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Existing Custom Paper Types:</div>
                {customPapers.map((paper) => (
                  <div key={paper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#f8fafc', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
                    <span>{paper}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustomPaper(paper, e)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddCustomOption}>
              <input
                type="text"
                placeholder={
                  modalType === 'size'
                    ? "e.g., A3 size, 8.5 x 11 in"
                    : "e.g., Ivory Ledger 100 GSM"
                }
                value={newInputText}
                onChange={(e) => setNewInputText(e.target.value)}
                className="calc-input"
                style={{ marginBottom: '1.25rem' }}
                autoFocus
              />
              <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-close"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save-defaults"
                  style={{
                    background: modalType === 'size' ? '#0D9488' : '#D97706',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  {modalType === 'size' ? 'Add Size' : 'Add Paper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADVANCED PRICING & COST SETTINGS (9 OPTIONS POPUP) */}
      {showAdvancedModal && (
        <div className="modal-overlay">
          <div className="calc-modal advanced-modal">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sliders size={22} color="#0d9488" />
                <div>
                  <h3 className="calc-modal-title" style={{ margin: 0, fontSize: '1.2rem' }}>
                    4. Advanced Pricing & Cost Settings
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    Configure margins, paper unit costs, plate costs, and extra charges
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvancedModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', maxHeight: '65vh', overflowY: 'auto', paddingRight: '0.25rem', marginBottom: '1.25rem' }}>
              {/* 1. Profit Percentage */}
              <div className="advanced-setting-card">
                <label className="advanced-setting-label">
                  <span>1. Profit Percentage (%)</span>
                  <span style={{ color: '#0d9488' }}>Standard: 40%</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input
                    type="number"
                    value={advancedSettings.profitPercentage}
                    onChange={(e) => updateAdvancedSetting('profitPercentage', Number(e.target.value))}
                    className="advanced-input-num"
                  />
                  <span style={{ fontWeight: 700, color: '#64748b' }}>%</span>
                </div>
              </div>

              {/* 2. Wastage */}
              <div className="advanced-setting-card">
                <label className="advanced-setting-label">
                  <span>2. Wastage Allowance (%)</span>
                  <span style={{ color: '#0d9488' }}>Standard: 15%</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input
                    type="number"
                    value={advancedSettings.wastagePercentage}
                    onChange={(e) => updateAdvancedSetting('wastagePercentage', Number(e.target.value))}
                    className="advanced-input-num"
                  />
                  <span style={{ fontWeight: 700, color: '#64748b' }}>%</span>
                </div>
              </div>

              {/* 3. Paper Price (Select Paper Type -> Price for one piece) */}
              <div className="advanced-setting-card" style={{ gridColumn: '1 / -1' }}>
                <label className="advanced-setting-label">
                  <span>3. Paper Price (per piece / sheet)</span>
                  <span style={{ color: '#0d9488' }}>Select paper & edit unit cost</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 140px', gap: '0.6rem', alignItems: 'center' }}>
                  <select
                    value={selectedPaperForPrice}
                    onChange={(e) => setSelectedPaperForPrice(e.target.value)}
                    className="paper-type-select"
                    style={{ width: '100%', padding: '0.4rem 0.65rem', fontSize: '0.84rem' }}
                  >
                    {allPaperOptions.map((paperName) => (
                      <option key={paperName} value={paperName}>
                        {paperName}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Rs.</span>
                    <input
                      type="number"
                      step="0.10"
                      value={advancedSettings.paperPrices[selectedPaperForPrice] !== undefined ? advancedSettings.paperPrices[selectedPaperForPrice] : 3.50}
                      onChange={(e) => updatePaperPrice(selectedPaperForPrice, e.target.value)}
                      className="advanced-input-num"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Plate Price */}
              <div className="advanced-setting-card">
                <label className="advanced-setting-label">
                  <span>4. Plate Price (Rs.)</span>
                  <span style={{ color: '#0d9488' }}>Standard: Rs. 1300</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Rs.</span>
                  <input
                    type="number"
                    step="50"
                    value={advancedSettings.platePrice}
                    onChange={(e) => updateAdvancedSetting('platePrice', Number(e.target.value))}
                    className="advanced-input-num"
                  />
                </div>
              </div>

              {/* 5. Impression */}
              <div className="advanced-setting-card">
                <label className="advanced-setting-label">
                  <span>5. Impression Cost (Rs./1000 sheets)</span>
                  <span style={{ color: '#0d9488' }}>Standard: Rs. 1000</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Rs.</span>
                  <input
                    type="number"
                    step="50"
                    value={advancedSettings.impressionCost}
                    onChange={(e) => updateAdvancedSetting('impressionCost', Number(e.target.value))}
                    className="advanced-input-num"
                  />
                </div>
              </div>

              {/* 6. Duplo Cost */}
              <div className="advanced-setting-card">
                <label className="advanced-setting-label">
                  <span>6. Duplo Cost (Rs./sheet)</span>
                  <span style={{ color: '#0d9488' }}>Standard: Rs. 3.50</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Rs.</span>
                  <input
                    type="number"
                    step="0.10"
                    value={advancedSettings.duploCost}
                    onChange={(e) => updateAdvancedSetting('duploCost', Number(e.target.value))}
                    className="advanced-input-num"
                  />
                </div>
              </div>

              {/* 7. Binding Charges */}
              <div className="advanced-setting-card">
                <label className="advanced-setting-label">
                  <span>7. Binding Charges (Rs./book)</span>
                  <span style={{ color: '#0d9488' }}>Standard: Rs. 80</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Rs.</span>
                  <input
                    type="number"
                    step="1"
                    value={advancedSettings.bindingChargesPerBook}
                    onChange={(e) => updateAdvancedSetting('bindingChargesPerBook', Number(e.target.value))}
                    className="advanced-input-num"
                  />
                </div>
              </div>

              {/* 8. Transport Charges */}
              <div className="advanced-setting-card" style={{ gridColumn: '1 / -1' }}>
                <label className="advanced-setting-label">
                  <span>8. Transport Charges (Rs. Total)</span>
                  <span style={{ color: '#0d9488' }}>Standard: Rs. 500</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Rs.</span>
                  <input
                    type="number"
                    step="50"
                    value={advancedSettings.transportCharges}
                    onChange={(e) => updateAdvancedSetting('transportCharges', Number(e.target.value))}
                    className="advanced-input-num"
                  />
                </div>
              </div>

              {/* 9. Additional Charges */}
              <div className="advanced-setting-card" style={{ gridColumn: '1 / -1' }}>
                <label className="advanced-setting-label">
                  <span>9. Additional Charges (Custom Extra Service)</span>
                  <span style={{ color: '#0d9488' }}>Text left, Amount right</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) 140px', gap: '0.6rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="e.g. Lamination, Numbering, Packing"
                    value={advancedSettings.additionalChargeName}
                    onChange={(e) => updateAdvancedSetting('additionalChargeName', e.target.value)}
                    className="advanced-input-text"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Rs.</span>
                    <input
                      type="number"
                      step="10"
                      value={advancedSettings.additionalChargeAmount}
                      onChange={(e) => updateAdvancedSetting('additionalChargeAmount', Number(e.target.value))}
                      className="advanced-input-num"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Professional Footer */}
            <div style={{
              borderTop: '1px solid #f1f5f9',
              paddingTop: '1.1rem',
              marginTop: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}>
              {/* Reset Button */}
              <button
                type="button"
                className="btn-modal-reset-modern"
                onClick={() => {
                  setAdvancedSettings({
                    profitPercentage: 40,
                    wastagePercentage: 15,
                    paperPrices: {
                      'NCR Carbonized Paper': 3.50,
                      'Bank Paper': 3.00,
                      'Art Paper 120g': 5.00,
                      'Art Paper 150g': 6.50,
                      'Art Board 230g': 10.00,
                      'Art Board 300g': 12.00,
                      'Bond Paper 80g': 4.00,
                      'Ledger Paper': 4.50,
                      'Manifold Paper': 2.50,
                      'Choose paper type': 3.00,
                    },
                    platePrice: 1300,
                    impressionCost: 1000,
                    duploCost: 3.5,
                    bindingChargesPerBook: 80,
                    transportCharges: 500,
                    additionalChargeName: '',
                    additionalChargeAmount: 0.00,
                  });
                  showToast('Reset to standard defaults');
                }}
              >
                <RotateCcw size={14} />
                <span>Reset Defaults</span>
              </button>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'stretch', gap: '0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}>
                {/* Save as Default & Apply — LEFT, secondary style */}
                <button
                  type="button"
                  className="btn-modal-secondary-modern"
                  onClick={() => {
                    localStorage.setItem('custom_bill_book_advanced_settings', JSON.stringify(advancedSettings));
                    setShowAdvancedModal(false);
                    showToast('Saved as default for future bills & applied to current bill');
                  }}
                  style={{ borderRadius: '12px 0 0 12px', borderRight: 'none' }}
                >
                  <Save size={15} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, lineHeight: 1.1 }}>Save as Default & Apply</div>
                    <div style={{ fontSize: '0.67rem', fontWeight: 500, color: '#94a3b8', lineHeight: 1.1 }}>All future bills</div>
                  </div>
                </button>

                {/* Divider */}
                <div style={{ width: '1px', background: '#e2e8f0' }} />

                {/* Apply to Current Bill — RIGHT, primary teal gradient */}
                <button
                  type="button"
                  className="btn-modal-primary-modern"
                  onClick={() => {
                    setShowAdvancedModal(false);
                    showToast('Applied pricing settings to current bill calculation');
                  }}
                  style={{ borderRadius: '0 12px 12px 0' }}
                >
                  <FileText size={15} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, lineHeight: 1.1 }}>Apply to Current Bill</div>
                    <div style={{ fontSize: '0.67rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)', lineHeight: 1.1 }}>Session only</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
