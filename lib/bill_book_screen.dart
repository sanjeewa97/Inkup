import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_auth/firebase_auth.dart';

class BillBookScreen extends StatefulWidget {
  const BillBookScreen({super.key});

  @override
  State<BillBookScreen> createState() => _BillBookScreenState();
}

class _BillBookScreenState extends State<BillBookScreen> {
  final List<String> _defaultSizes = [
    'A4 size',
    'A5 size',
    'A6 size',
    'A4/3 size',
    'A4/4 size',
  ];
  List<String> _customSizes = [];
  String _selectedSize = 'A4 size';
  int _quantity = 10;
  bool _isLoading = true;
  bool _isAdminMode = false;

  final List<String> _adminEmails = [
    '97drag0nrider@gmail.com',
    'sanjeewa97@gmail.com',
    'printestimator.dev@gmail.com',
  ];

  @override
  void initState() {
    super.initState();
    _checkOwnerEmail();
    _loadCustomSizes();
  }

  void _checkOwnerEmail() {
    final user = FirebaseAuth.instance.currentUser;
    final email = user?.email?.toLowerCase().trim() ?? '';
    if (_adminEmails.contains(email)) {
      _isAdminMode = true;
    }
  }

  Future<void> _loadCustomSizes() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getStringList('custom_bill_book_sizes') ?? [];
    setState(() {
      _customSizes = saved;
      _isLoading = false;
    });
  }

  Future<void> _addCustomSize(String newSize) async {
    final trimmed = newSize.trim();
    if (trimmed.isEmpty) return;
    if (_defaultSizes.contains(trimmed) || _customSizes.contains(trimmed)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('"$trimmed" is already in the list!')),
        );
      }
      return;
    }

    final prefs = await SharedPreferences.getInstance();
    final updated = List<String>.from(_customSizes)..add(trimmed);
    await prefs.setStringList('custom_bill_book_sizes', updated);

    setState(() {
      _customSizes = updated;
      _onSizeChanged(trimmed);
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Added and selected "$trimmed"'),
          backgroundColor: Colors.teal,
        ),
      );
    }
  }

  Future<void> _deleteCustomSize(String sizeToDelete) async {
    final prefs = await SharedPreferences.getInstance();
    final updated = List<String>.from(_customSizes)..remove(sizeToDelete);
    await prefs.setStringList('custom_bill_book_sizes', updated);

    setState(() {
      _customSizes = updated;
      if (_selectedSize == sizeToDelete) {
        _onSizeChanged(_defaultSizes.first);
      }
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Removed "$sizeToDelete"')),
      );
    }
  }

  void _showAddSizeDialog() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.add_circle_outline, color: Colors.teal, size: 28),
              SizedBox(width: 10),
              Text(
                'Add Custom Size',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ],
          ),
          content: TextField(
            controller: controller,
            autofocus: true,
            decoration: InputDecoration(
              labelText: 'Book Size Name',
              hintText: 'e.g., A3 size, 8.5 x 11 in',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Colors.teal, width: 2),
              ),
            ),
            onSubmitted: (value) {
              Navigator.pop(context);
              _addCustomSize(value);
            },
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _addCustomSize(controller.text);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Add Size'),
            ),
          ],
        );
      },
    );
  }

  int _getRequiredMultiple(String sizeName) {
    final lower = sizeName.toLowerCase().trim();
    if (lower == 'a4 size' || lower == 'a4') return 1;
    if (lower == 'a5 size' || lower == 'a5') return 2;
    if (lower == 'a6 size' || lower == 'a6') return 4;
    if (lower == 'a4/3 size' || lower == 'a4/3' || lower.contains('a4/3')) return 3;
    if (lower == 'a4/4 size' || lower == 'a4/4' || lower.contains('a4/4')) return 4;
    return 1;
  }

  int _getDefaultQuantity(int multiple) {
    switch (multiple) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 3:
        return 3;
      case 4:
        return 4;
      default:
        return multiple;
    }
  }

  List<int> _getQuantityDropdownOptions(int multiple) {
    switch (multiple) {
      case 1:
        return [1, 2, 5, 10, 15, 20, 25, 50, 100, 200];
      case 2:
        return [2, 4, 6, 8, 10, 12, 20, 30, 50, 100];
      case 3:
        return [3, 6, 9, 12, 15, 30, 60, 90, 120];
      case 4:
        return [4, 8, 12, 16, 20, 40, 60, 80, 100];
      default:
        return [
          multiple,
          multiple * 2,
          multiple * 5,
          multiple * 10,
          multiple * 20,
          multiple * 50
        ];
    }
  }

  void _onSizeChanged(String newSize) {
    final newMultiple = _getRequiredMultiple(newSize);

    setState(() {
      _selectedSize = newSize;
      if (_quantity % newMultiple != 0 || _quantity < newMultiple) {
        // Automatically adjust to valid quantity if old quantity doesn't match new rule
        _quantity = _getDefaultQuantity(newMultiple);
      }
    });
  }

  void _onQuantityChanged(int newQty) {
    setState(() {
      _quantity = newQty;
    });
  }

  @override
  Widget build(BuildContext context) {
    final allSizes = [..._defaultSizes, ..._customSizes];
    final requiredMultiple = _getRequiredMultiple(_selectedSize);
    final quantityOptions = _getQuantityDropdownOptions(requiredMultiple);

    // Make sure current _quantity is in quantityOptions, otherwise add it and sort
    if (!quantityOptions.contains(_quantity)) {
      quantityOptions.add(_quantity);
      quantityOptions.sort();
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: const Text(
          'Bill Book Estimator',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Color(0xFF1A1A1A),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: Color(0xFF1A1A1A)),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SafeArea(
              child: Column(
                children: [
                  // Top Banner
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF009688), Color(0xFF00796B)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    child: const Row(
                      children: [
                        Icon(
                          Icons.receipt_long,
                          color: Colors.white,
                          size: 28,
                        ),
                        SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Customize Bill Book Order',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Select all specifications from the dropdowns below.',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Admin banner (only visible to owner)
                  if (_isAdminMode)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      color: Colors.amber.shade100,
                      child: Row(
                        children: [
                          Icon(
                            Icons.admin_panel_settings,
                            color: Colors.amber.shade900,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'OWNER MODE ACTIVE: You can add or remove custom options below.',
                              style: TextStyle(
                                color: Colors.amber.shade900,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Scrollable Form Area
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          // 1. Book Size Card
                          _buildOptionCard(
                            stepNumber: '1',
                            title: 'Book Size',
                            subtitle: 'Select from standard or custom sizes',
                            icon: Icons.aspect_ratio_rounded,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                DropdownButtonFormField<String>(
                                  initialValue: _selectedSize,
                                  isExpanded: true,
                                  decoration: InputDecoration(
                                    filled: true,
                                    fillColor: const Color(0xFFF9FAFB),
                                    contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 14,
                                    ),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(color: Colors.grey.shade300),
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(color: Colors.grey.shade300),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(
                                        color: Colors.teal,
                                        width: 2,
                                      ),
                                    ),
                                  ),
                                  icon: const Icon(
                                    Icons.keyboard_arrow_down_rounded,
                                    color: Colors.teal,
                                    size: 26,
                                  ),
                                  items: allSizes.map((size) {
                                    final isCustom = _customSizes.contains(size);
                                    return DropdownMenuItem<String>(
                                      value: size,
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              size,
                                              style: const TextStyle(
                                                fontSize: 15,
                                                fontWeight: FontWeight.w600,
                                                color: Color(0xFF1A1A1A),
                                              ),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          if (isCustom && _isAdminMode)
                                            GestureDetector(
                                              onTap: () {
                                                _deleteCustomSize(size);
                                              },
                                              child: Icon(
                                                Icons.delete_outline,
                                                color: Colors.redAccent.shade200,
                                                size: 20,
                                              ),
                                            ),
                                        ],
                                      ),
                                    );
                                  }).toList(),
                                  onChanged: (val) {
                                    if (val != null) {
                                      _onSizeChanged(val);
                                    }
                                  },
                                ),
                                if (_isAdminMode) ...[
                                  const SizedBox(height: 10),
                                  Align(
                                    alignment: Alignment.centerRight,
                                    child: TextButton.icon(
                                      onPressed: _showAddSizeDialog,
                                      icon: const Icon(
                                        Icons.add_circle_outline,
                                        size: 18,
                                        color: Colors.teal,
                                      ),
                                      label: const Text(
                                        'Add Custom Size',
                                        style: TextStyle(
                                          color: Colors.teal,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),

                          const SizedBox(height: 16),

                          // 2. Book Quantity Card
                          _buildOptionCard(
                            stepNumber: '2',
                            title: 'Book Quantity',
                            subtitle: requiredMultiple == 1
                                ? 'Any quantity allowed for $_selectedSize'
                                : 'Must be in multiples of $requiredMultiple for $_selectedSize',
                            icon: Icons.format_list_numbered_rounded,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    // Dropdown of Valid Multiples
                                    Expanded(
                                      child: DropdownButtonFormField<int>(
                                        initialValue: _quantity,
                                        isExpanded: true,
                                        decoration: InputDecoration(
                                          filled: true,
                                          fillColor: const Color(0xFFF9FAFB),
                                          contentPadding:
                                              const EdgeInsets.symmetric(
                                            horizontal: 16,
                                            vertical: 14,
                                          ),
                                          border: OutlineInputBorder(
                                            borderRadius:
                                                BorderRadius.circular(12),
                                            borderSide: BorderSide(
                                              color: Colors.grey.shade300,
                                            ),
                                          ),
                                          enabledBorder: OutlineInputBorder(
                                            borderRadius:
                                                BorderRadius.circular(12),
                                            borderSide: BorderSide(
                                              color: Colors.grey.shade300,
                                            ),
                                          ),
                                          focusedBorder: OutlineInputBorder(
                                            borderRadius:
                                                BorderRadius.circular(12),
                                            borderSide: const BorderSide(
                                              color: Colors.teal,
                                              width: 2,
                                            ),
                                          ),
                                        ),
                                        icon: const Icon(
                                          Icons.keyboard_arrow_down_rounded,
                                          color: Colors.teal,
                                          size: 26,
                                        ),
                                        items: quantityOptions.map((qty) {
                                          return DropdownMenuItem<int>(
                                            value: qty,
                                            child: Text(
                                              '$qty',
                                              style: const TextStyle(
                                                fontSize: 15,
                                                fontWeight: FontWeight.w600,
                                                color: Color(0xFF1A1A1A),
                                              ),
                                            ),
                                          );
                                        }).toList(),
                                        onChanged: (val) {
                                          if (val != null) {
                                            _onQuantityChanged(val);
                                          }
                                        },
                                      ),
                                    ),
                                    const SizedBox(width: 6),

                                    // Stepper Minus button
                                    _buildCircleButton(
                                      icon: Icons.remove,
                                      onPressed: () {
                                        if (_quantity > requiredMultiple) {
                                          _onQuantityChanged(
                                            _quantity - requiredMultiple,
                                          );
                                        }
                                      },
                                    ),
                                    const SizedBox(width: 6),

                                    // Stepper Plus button
                                    _buildCircleButton(
                                      icon: Icons.add,
                                      onPressed: () {
                                        _onQuantityChanged(
                                          _quantity + requiredMultiple,
                                        );
                                      },
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  '💡 Increment/Decrement steps by $requiredMultiple automatically.',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 16),

                          // 3. Option 3 Placeholder Card (Ready for next!)
                          _buildOptionCard(
                            stepNumber: '3',
                            title: 'Next Option',
                            subtitle: 'More customization options coming next...',
                            icon: Icons.tune_rounded,
                            child: Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(
                                vertical: 14,
                                horizontal: 16,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.grey.shade100,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.grey.shade300),
                              ),
                              child: const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.add_circle_outline,
                                    color: Colors.grey,
                                    size: 20,
                                  ),
                                  SizedBox(width: 8),
                                  Flexible(
                                    child: Text(
                                      'Tell me what Option 3 should be!',
                                      style: TextStyle(
                                        color: Colors.grey,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Bottom Summary & Action Bar
                  _buildBottomBar(),
                ],
              ),
            ),
    );
  }

  Widget _buildOptionCard({
    required String stepNumber,
    required String title,
    required String subtitle,
    required IconData icon,
    required Widget child,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFFE0F2F1),
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: Text(
                  stepNumber,
                  style: const TextStyle(
                    color: Colors.teal,
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A1A),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(icon, color: Colors.teal.shade300, size: 22),
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildCircleButton({
    required IconData icon,
    required VoidCallback onPressed,
  }) {
    return Material(
      color: const Color(0xFFF0F4F8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade300),
      ),
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(10),
          child: Icon(icon, color: const Color(0xFF1A1A1A), size: 20),
        ),
      ),
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Current Selection Summary
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Current Selection',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                const SizedBox(height: 2),
                Text(
                  '$_selectedSize  •  $_quantity',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A1A1A),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),

          // Calculate Button
          ElevatedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    'Selected: $_selectedSize | Quantity: $_quantity. Ready for Option 3...',
                  ),
                  backgroundColor: Colors.teal,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.teal,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              elevation: 2,
            ),
            icon: const Text(
              'Calculate',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            label: const Icon(Icons.arrow_forward_rounded, size: 18),
          ),
        ],
      ),
    );
  }
}
