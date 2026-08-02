import 'package:flutter/material.dart';

class BillBookQuantityScreen extends StatefulWidget {
  final String selectedSize;

  const BillBookQuantityScreen({super.key, required this.selectedSize});

  @override
  State<BillBookQuantityScreen> createState() => _BillBookQuantityScreenState();
}

class _BillBookQuantityScreenState extends State<BillBookQuantityScreen> {
  late int _requiredMultiple;
  late int _quantity;
  late TextEditingController _controller;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _requiredMultiple = _getRequiredMultiple(widget.selectedSize);
    _quantity = _getDefaultQuantity(_requiredMultiple);
    _controller = TextEditingController(text: _quantity.toString());
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  int _getRequiredMultiple(String sizeName) {
    final lower = sizeName.toLowerCase().trim();
    if (lower == 'a4 size' || lower == 'a4') return 1;
    if (lower == 'a5 size' || lower == 'a5') return 2;
    if (lower == 'a6 size' || lower == 'a6') return 4;
    if (lower == 'a4/3 size' || lower == 'a4/3' || lower.contains('a4/3'))
      return 3;
    if (lower == 'a4/4 size' || lower == 'a4/4' || lower.contains('a4/4'))
      return 4;
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

  List<int> _getQuickSelectOptions(int multiple) {
    switch (multiple) {
      case 1:
        return [1, 5, 10, 20, 50, 100];
      case 2:
        return [2, 4, 10, 20, 50, 100];
      case 3:
        return [3, 6, 12, 30, 60, 120];
      case 4:
        return [4, 8, 16, 20, 40, 100];
      default:
        return [
          multiple,
          multiple * 2,
          multiple * 5,
          multiple * 10,
          multiple * 20,
          multiple * 50,
        ];
    }
  }

  void _updateQuantity(int newQty) {
    if (newQty < _requiredMultiple) {
      newQty = _requiredMultiple;
    }
    setState(() {
      _quantity = newQty;
      _controller.text = newQty.toString();
      _controller.selection = TextSelection.fromPosition(
        TextPosition(offset: _controller.text.length),
      );
      _validateQuantity(newQty);
    });
  }

  void _validateQuantity(int val) {
    if (val <= 0) {
      _errorMessage = 'Quantity must be at least $_requiredMultiple';
    } else if (val % _requiredMultiple != 0) {
      _errorMessage =
          'For ${widget.selectedSize}, quantity must be a multiple of $_requiredMultiple (e.g. $_requiredMultiple, ${_requiredMultiple * 2}, ${_requiredMultiple * 3}...)';
    } else {
      _errorMessage = null;
    }
  }

  void _onTextSubmitted(String val) {
    final parsed = int.tryParse(val) ?? _quantity;
    setState(() {
      _quantity = parsed;
      _validateQuantity(parsed);
    });
  }

  void _autoCorrect() {
    int corrected = (_quantity ~/ _requiredMultiple) * _requiredMultiple;
    if (corrected < _requiredMultiple) {
      corrected = _requiredMultiple;
    }
    _updateQuantity(corrected);
  }

  @override
  Widget build(BuildContext context) {
    final quickOptions = _getQuickSelectOptions(_requiredMultiple);
    final isValid =
        _errorMessage == null &&
        _quantity > 0 &&
        (_quantity % _requiredMultiple == 0);

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
      body: SafeArea(
        child: Column(
          children: [
            // Top Step Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1E88E5), Color(0xFF1565C0)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.format_list_numbered_rounded,
                      color: Colors.white,
                      size: 32,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Option 2: Book Quantity',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Selected Size: ${widget.selectedSize}',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Rule Info Badge
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              color: const Color(0xFFE3F2FD),
              child: Row(
                children: [
                  const Icon(
                    Icons.info_outline,
                    color: Color(0xFF1565C0),
                    size: 20,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _requiredMultiple == 1
                          ? 'For ${widget.selectedSize}, you can select any book quantity.'
                          : 'For ${widget.selectedSize}, quantity MUST be in multiples of $_requiredMultiple ($_requiredMultiple, ${_requiredMultiple * 2}, ${_requiredMultiple * 3}...).',
                      style: const TextStyle(
                        color: Color(0xFF1565C0),
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Main Interactive Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Quick Select Section
                    const Text(
                      'Quick Select Quantity',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A1A),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: quickOptions.map((qty) {
                        final isSelected = _quantity == qty;
                        return GestureDetector(
                          onTap: () => _updateQuantity(qty),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 150),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 18,
                              vertical: 12,
                            ),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? const Color(0xFF1E88E5)
                                  : Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: isSelected
                                    ? const Color(0xFF1565C0)
                                    : Colors.grey.shade300,
                                width: isSelected ? 2 : 1,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.04),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Text(
                              '$qty',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: isSelected
                                    ? Colors.white
                                    : const Color(0xFF333333),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 32),

                    // Custom Stepper / Direct Input
                    const Text(
                      'Or Enter Custom Quantity',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A1A),
                      ),
                    ),
                    const SizedBox(height: 14),

                    Row(
                      children: [
                        // Minus Button
                        _buildStepperButton(
                          icon: Icons.remove,
                          onPressed: () {
                            if (_quantity > _requiredMultiple) {
                              _updateQuantity(_quantity - _requiredMultiple);
                            }
                          },
                        ),
                        const SizedBox(width: 14),

                        // Input TextField
                        Expanded(
                          child: TextField(
                            controller: _controller,
                            keyboardType: TextInputType.number,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1A1A1A),
                            ),
                            decoration: InputDecoration(
                              filled: true,
                              fillColor: Colors.white,
                              contentPadding: const EdgeInsets.symmetric(
                                vertical: 16,
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(16),
                                borderSide: BorderSide(
                                  color: isValid
                                      ? Colors.grey.shade300
                                      : Colors.redAccent,
                                  width: 1.5,
                                ),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(16),
                                borderSide: BorderSide(
                                  color: isValid
                                      ? const Color(0xFF1E88E5)
                                      : Colors.redAccent,
                                  width: 2,
                                ),
                              ),
                            ),
                            onChanged: (val) {
                              final parsed = int.tryParse(val) ?? 0;
                              setState(() {
                                _quantity = parsed;
                                _validateQuantity(parsed);
                              });
                            },
                            onSubmitted: _onTextSubmitted,
                          ),
                        ),

                        const SizedBox(width: 14),

                        // Plus Button
                        _buildStepperButton(
                          icon: Icons.add,
                          onPressed: () {
                            _updateQuantity(_quantity + _requiredMultiple);
                          },
                        ),
                      ],
                    ),

                    // Validation Error Banner
                    if (_errorMessage != null) ...[
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.red.shade200),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.error_outline,
                              color: Colors.red.shade700,
                              size: 22,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: TextStyle(
                                  color: Colors.red.shade800,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            TextButton(
                              onPressed: _autoCorrect,
                              child: const Text(
                                'Fix',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1E88E5),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

            // Bottom Bar
            _buildBottomBar(isValid),
          ],
        ),
      ),
    );
  }

  Widget _buildStepperButton({
    required IconData icon,
    required VoidCallback onPressed,
  }) {
    return Material(
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade300),
      ),
      elevation: 2,
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          child: Icon(icon, color: const Color(0xFF1A1A1A), size: 26),
        ),
      ),
    );
  }

  Widget _buildBottomBar(bool isValid) {
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
          // Left Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Book Quantity',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                const SizedBox(height: 2),
                Text(
                  '$_quantity (${widget.selectedSize})',
                  style: const TextStyle(
                    fontSize: 15,
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

          // Next Button
          ElevatedButton.icon(
            onPressed: isValid
                ? () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          'Size: ${widget.selectedSize} | Quantity: $_quantity. Ready for Option 3...',
                        ),
                        backgroundColor: Colors.teal,
                      ),
                    );
                  }
                : () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          'Please select a valid multiple of $_requiredMultiple for ${widget.selectedSize}!',
                        ),
                        backgroundColor: Colors.redAccent,
                      ),
                    );
                  },
            style: ElevatedButton.styleFrom(
              backgroundColor: isValid ? const Color(0xFF1E88E5) : Colors.grey,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              elevation: isValid ? 2 : 0,
            ),
            icon: const Text(
              'Next',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            label: const Icon(Icons.arrow_forward_rounded, size: 18),
          ),
        ],
      ),
    );
  }
}
