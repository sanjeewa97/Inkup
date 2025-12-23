import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  final Map<String, Map<String, double>> _itemDefaults = {};

  @override
  void initState() {
    super.initState();
    _loadDefaults();
  }

  Future<void> _loadDefaults() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      
      const items = [
        'Bill Book', 'Pad Book', 'Poly Bag Print', 'Photo Frame',
        'Customize Frame', 'Name Board', 'Light Board', 'Stand Board'
      ];
      
      for (var item in items) {
        final cost = prefs.getDouble('cost_$item') ?? 0.0;
        final price = prefs.getDouble('price_$item') ?? 0.0;
        if (cost > 0 || price > 0) {
          _itemDefaults[item] = {'cost': cost, 'price': price};
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // Main layout.
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Welcome back,',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Printing Shop Name',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold, 
                      color: Color(0xFF1A1A1A), 
                      letterSpacing: -0.5, 
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: GridView.count(
                  // 3 column grid.
                  crossAxisCount: 3, 
                  crossAxisSpacing: 12, 
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.9, 
                  children: [
                    MenuCard(
                      icon: Icons.receipt_long,
                      label: 'Bill Book',
                      color: Colors.deepOrange,
                      onTap: () => _showCalculator(context, 'Bill Book'),
                    ),
                    MenuCard(
                      icon: Icons.menu_book,
                      label: 'Pad Book',
                      color: Colors.indigo,
                      onTap: () => _showCalculator(context, 'Pad Book'),
                    ),
                    MenuCard(
                      icon: Icons.shopping_bag,
                      label: 'Poly Bag\nPrint',
                      color: Colors.purple,
                      onTap: () => _showCalculator(context, 'Poly Bag Print'),
                    ),
                    MenuCard(
                      icon: Icons.photo_library,
                      label: 'Photo Frame',
                      color: Colors.teal,
                      onTap: () => _showCalculator(context, 'Photo Frame'),
                    ),
                    MenuCard(
                      icon: Icons.edit_note,
                      label: 'Customize\nFrame',
                      color: Colors.pink,
                      onTap: () => _showCalculator(context, 'Customize Frame'),
                    ),
                    MenuCard(
                      icon: Icons.branding_watermark,
                      label: 'Name Board',
                      color: Colors.brown,
                      onTap: () => _showCalculator(context, 'Name Board'),
                    ),
                    MenuCard(
                      icon: Icons.lightbulb,
                      label: 'Light Board',
                      color: Colors.amber,
                      onTap: () => _showCalculator(context, 'Light Board'),
                    ),
                    MenuCard(
                      icon: Icons.table_bar,
                      label: 'Stand Board',
                      color: Colors.blueGrey,
                      onTap: () => _showCalculator(context, 'Stand Board'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(32),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildNavItem(0, Icons.home_outlined, 'Home'),
            _buildNavItem(1, Icons.dashboard_customize_outlined, 'Other'),
            _buildNavItem(2, Icons.notifications_none_outlined, 'Notification'),
            _buildNavItem(3, Icons.person_outline_rounded, 'Account'),
          ],
        ),
      ),
    );
  }


  // Show calculator.
  void _showCalculator(BuildContext context, String itemName) {
    final defaults = _itemDefaults[itemName] ?? {'cost': 0.0, 'price': 0.0};
    showDialog(
      context: context,
      builder: (context) => CalculatorDialog(
        itemName: itemName,
        initialCost: defaults['cost']!,
        initialPrice: defaults['price']!,
        onSaveDefaults: (cost, price) async {
          setState(() {
            _itemDefaults[itemName] = {'cost': cost, 'price': price};
          });
          
          final prefs = await SharedPreferences.getInstance();
          await prefs.setDouble('cost_$itemName', cost);
          await prefs.setDouble('price_$itemName', price);

          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Defaults saved for $itemName')),
            );
          }
        },
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final isSelected = _selectedIndex == index;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedIndex = index;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(horizontal: isSelected ? 16 : 12, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? Colors.teal : Colors.transparent, 
          borderRadius: BorderRadius.circular(24),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isSelected ? Colors.white : Colors.black87,
              size: 26,
            ),
            if (isSelected) ...[
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class CalculatorDialog extends StatefulWidget {
  final String itemName;
  final double initialCost;
  final double initialPrice;
  final Function(double, double) onSaveDefaults;

  const CalculatorDialog({
    super.key,
    required this.itemName,
    required this.initialCost,
    required this.initialPrice,
    required this.onSaveDefaults,
  });

  @override
  State<CalculatorDialog> createState() => _CalculatorDialogState();
}

class _CalculatorDialogState extends State<CalculatorDialog> {
  final _qtyController = TextEditingController();
  late TextEditingController _costController;
  late TextEditingController _priceController;

  double _totalCost = 0;
  double _totalRevenue = 0;
  double _profit = 0;

  @override
  void initState() {
    super.initState();
    _costController = TextEditingController(text: widget.initialCost > 0 ? widget.initialCost.toStringAsFixed(2) : '');
    _priceController = TextEditingController(text: widget.initialPrice > 0 ? widget.initialPrice.toStringAsFixed(2) : '');
  }

  @override
  void dispose() {
    _qtyController.dispose();
    _costController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  void _calculate() {
    final qty = double.tryParse(_qtyController.text) ?? 0;
    final unitCost = double.tryParse(_costController.text) ?? 0;
    final unitPrice = double.tryParse(_priceController.text) ?? 0;

    setState(() {
      _totalCost = qty * unitCost;
      _totalRevenue = qty * unitPrice;
      _profit = _totalRevenue - _totalCost;
    });
  }

  void _saveDefaults() {
    final unitCost = double.tryParse(_costController.text) ?? 0;
    final unitPrice = double.tryParse(_priceController.text) ?? 0;
    widget.onSaveDefaults(unitCost, unitPrice);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)), 
      title: Text('Calculate: ${widget.itemName}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 10),
            TextField(
              controller: _qtyController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Quantity',
                filled: true,
                fillColor: Color(0xFFF0F2F5),
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12)), borderSide: BorderSide.none),
              ),
              onChanged: (_) => _calculate(),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _costController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Unit Cost (Rs)',
                filled: true,
                fillColor: Color(0xFFF0F2F5),
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12)), borderSide: BorderSide.none),
              ),
              onChanged: (_) => _calculate(),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _priceController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Unit Selling Price (Rs)',
                filled: true,
                 fillColor: Color(0xFFF0F2F5),
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(12)), borderSide: BorderSide.none),
              ),
              onChanged: (_) => _calculate(),
            ),
            const SizedBox(height: 20),
            const SizedBox(height: 20),
            // Selling Price
            _buildResultRow('Selling Price:', _totalRevenue, Colors.blue),
            
            // Total Cost
            Align(
              alignment: Alignment.centerLeft,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4.0),
                child: Text(
                  'Total Cost: Rs ${_totalCost.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),

            // Profit
            Align(
              alignment: Alignment.centerLeft,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4.0),
                child: Text(
                  'Profit: Rs ${_profit.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.green, 
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _saveDefaults,
          child: const Text('Save Defaults'),
        ),
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Close'),
        ),
      ],
    );
  }

  Widget _buildResultRow(String label, double value, Color color, {bool isBold = false, double fontSize = 14}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.normal, fontSize: isBold ? 16 : 14)),
          Text(
            'Rs ${value.toStringAsFixed(2)}',
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: isBold ? (fontSize > 14 ? fontSize : 18) : 14,
            ),
          ),
        ],
      ),
    );
  }
}

class MenuCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback? onTap;

  const MenuCard({
    super.key,
    required this.icon,
    required this.label,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle, // Circular icon background
              ),
              child: Icon(icon, size: 28, color: color),
            ),
            const SizedBox(height: 12),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 12, // Slightly larger font
                fontWeight: FontWeight.w600,
                color: Color(0xFF333333),
              ),
              maxLines: 2, 
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
