import 'package:flutter_test/flutter_test.dart';
import 'package:inkup/home_screen.dart';
import 'package:inkup/main.dart';

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
