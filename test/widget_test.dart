import 'package:flutter_test/flutter_test.dart';
import 'package:print_estimator/main.dart';

void main() {
  testWidgets('Home screen smoke test', (WidgetTester tester) async {
    // Build app.
    await tester.pumpWidget(const MyApp());

    // Verify title.
    expect(find.text('Printing Shop Name'), findsOneWidget);

    // Verify menu item.
    expect(find.text('Bill Book'), findsOneWidget);

    // Verify tab.
    expect(find.text('Home'), findsOneWidget);
  });
}
