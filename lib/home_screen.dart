import 'package:flutter/material.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    // Main layout.
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24.0),
              child: Text(
                'Printing Shop Name',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF333333),
                  letterSpacing: 0.5,
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: GridView.count(
                  // 4 column grid.
                  crossAxisCount: 4, 
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.75, 
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

  final Map<String, Map<String, double>> _itemDefaults = {};

  // Show calculator.
  void _showCalculator(BuildContext context, String itemName) {
    final defaults = _itemDefaults[itemName] ?? {'cost': 0.0, 'price': 0.0};
    showDialog(
      context: context,
      builder: (context) => CalculatorDialog(
        itemName: itemName,
        initialCost: defaults['cost']!,
        initialPrice: defaults['price']!,
        onSaveDefaults: (cost, price) {
          setState(() {
            _itemDefaults[itemName] = {'cost': cost, 'price': price};
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Defaults saved for $itemName')),
          );
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
    _costController = TextEditingController(text: widget.initialCost > 0 ? widget.initialCost.toString() : '');
    _priceController = TextEditingController(text: widget.initialPrice > 0 ? widget.initialPrice.toString() : '');
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
      title: Text('Calculate: ${widget.itemName}', style: const TextStyle(fontSize: 18)),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _qtyController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Quantity'),
              onChanged: (_) => _calculate(),
            ),
            TextField(
              controller: _costController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Unit Cost'),
              onChanged: (_) => _calculate(),
            ),
            TextField(
              controller: _priceController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Unit Selling Price'),
              onChanged: (_) => _calculate(),
            ),
            const SizedBox(height: 20),
            _buildResultRow('Total Cost:', _totalCost, Colors.red),
            _buildResultRow('Total Revenue:', _totalRevenue, Colors.blue),
            const Divider(),
            _buildResultRow('Profit:', _profit, Colors.green, isBold: true),
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

  Widget _buildResultRow(String label, double value, Color color, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
          Text(
            value.toStringAsFixed(2),
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: isBold ? 18 : 14,
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
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: color.withOpacity(0.2), width: 1.5),
            ),
            child: Icon(icon, size: 28, color: color),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: Color(0xFF444444),
              height: 1.1,
            ),
            maxLines: 2, 
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
